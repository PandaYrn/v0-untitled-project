module soundwave::streaming {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use soundwave::nft::{Self, SoundWaveNFT};

    // Error constants
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EAssetNotFound: u64 = 2;
    const EInvalidSubscriptionPeriod: u64 = 3;
    const ESubscriptionNotActive: u64 = 4;
    const EInvalidContentType: u64 = 5;

    // Events
    struct StreamingPayment has copy, drop {
        content_id: ID,
        creator: address,
        amount: u64,
        consumer: address,
    }

    struct SubscriptionCreated has copy, drop {
        subscription_id: ID,
        subscriber: address,
        subscription_type: String,
        duration_days: u64,
        amount: u64,
    }

    struct ContentRegistered has copy, drop {
        content_id: ID,
        creator: address,
        content_type: String,
        title: String,
    }

    // Subscription types
    struct Subscription has key {
        id: UID,
        subscriber: address,
        subscription_type: String,
        start_time: u64,
        end_time: u64,
        active: bool,
    }

    // Streaming content registry
    struct ContentRegistry has key {
        id: UID,
        owner: address,
        music_content: Table<ID, address>,
        movie_content: Table<ID, address>,
        stream_count: Table<ID, u64>,
    }

    // Streaming platform
    struct StreamingPlatform has key {
        id: UID,
        owner: address,
        platform_fee_percentage: u64,
        creator_share_percentage: u64,
        subscription_revenue: Coin<SUI>,
        subscribers: Table<address, ID>,
    }

    // Initialize the streaming platform
    fun init(ctx: &mut TxContext) {
        let platform = StreamingPlatform {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            platform_fee_percentage: 200, // 2%
            creator_share_percentage: 7000, // 70%
            subscription_revenue: coin::zero<SUI>(ctx),
            subscribers: table::new(ctx),
        };

        let registry = ContentRegistry {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            music_content: table::new(ctx),
            movie_content: table::new(ctx),
            stream_count: table::new(ctx),
        };

        transfer::share_object(platform);
        transfer::share_object(registry);
    }

    // Register content for streaming
    public entry fun register_content(
        registry: &mut ContentRegistry,
        nft: &SoundWaveNFT,
        ctx: &mut TxContext
    ) {
        let content_id = object::id(nft);
        let (title, _, _, content_type, creator, _, _, _, _, _) = nft::get_nft_info(nft);
        
        // Verify caller is the content creator
        assert!(tx_context::sender(ctx) == creator, EUnauthorizedCaller);
        
        // Register content based on type
        if (content_type == string::utf8(b"music")) {
            table::add(&mut registry.music_content, content_id, creator);
        } else if (content_type == string::utf8(b"movie")) {
            table::add(&mut registry.movie_content, content_id, creator);
        } else {
            abort EInvalidContentType
        };
        
        // Initialize stream count
        if (!table::contains(&registry.stream_count, content_id)) {
            table::add(&mut registry.stream_count, content_id, 0);
        };
        
        // Emit content registered event
        event::emit(ContentRegistered {
            content_id,
            creator,
            content_type,
            title,
        });
    }

    // Stream content with pay-per-view
    public entry fun stream_content(
        registry: &mut ContentRegistry,
        platform: &mut StreamingPlatform,
        content_id: ID,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Check if content exists
        let content_exists = table::contains(&registry.music_content, content_id) || 
                            table::contains(&registry.movie_content, content_id);
        assert!(content_exists, EAssetNotFound);
        
        // Get content creator
        let creator = if (table::contains(&registry.music_content, content_id)) {
            *table::borrow(&registry.music_content, content_id)
        } else {
            *table::borrow(&registry.movie_content, content_id)
        };
        
        // Check if user has an active subscription
        let sender = tx_context::sender(ctx);
        let has_subscription = table::contains(&platform.subscribers, sender) &&
                              has_active_subscription(platform, sender, ctx);
        
        // If no subscription, process payment
        if (!has_subscription) {
            // Check if payment has sufficient balance
            assert!(coin::value(payment) >= amount, EInsufficientBalance);
            
            // Calculate platform fee and creator share
            let platform_fee = (amount * platform.platform_fee_percentage) / 10000;
            let creator_amount = amount - platform_fee;
            
            // Split coin and transfer fee to platform owner
            let fee_coin = coin::split(payment, platform_fee, ctx);
            transfer::public_transfer(fee_coin, platform.owner);
            
            // Transfer creator share
            let creator_payment = coin::split(payment, creator_amount, ctx);
            transfer::public_transfer(creator_payment, creator);
            
            // Emit streaming payment event
            event::emit(StreamingPayment {
                content_id,
                creator,
                amount: creator_amount,
                consumer: sender,
            });
        }
        
        // Increment stream count
        if (table::contains(&registry.stream_count, content_id)) {
            let count = table::borrow_mut(&mut registry.stream_count, content_id);
            *count = *count + 1;
        };
    }

    // Subscribe to the platform
    public entry fun create_subscription(
        platform: &mut StreamingPlatform,
        subscription_type: vector<u8>,
        duration_days: u64,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Validate subscription period (1, 3, 6, or 12 months)
        assert!(
            duration_days == 30 || duration_days == 90 || duration_days == 180 || duration_days == 365,
            EInvalidSubscriptionPeriod
        );
        
        // Calculate price based on duration
        let price = calculate_subscription_price(duration_days);
        
        // Check if payment has sufficient balance
        assert!(coin::value(payment) >= price, EInsufficientBalance);
        
        // Split coin and transfer payment to platform
        let subscription_payment = coin::split(payment, price, ctx);
        coin::join(&mut platform.subscription_revenue, subscription_payment);
        
        // Create user subscription
        let subscriber = tx_context::sender(ctx);
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let end_time = current_time + (duration_days * 24 * 60 * 60 * 1000); // milliseconds
        
        let subscription_id = object::new(ctx);
        let subscription = Subscription {
            id: subscription_id,
            subscriber,
            subscription_type: string::utf8(subscription_type),
            start_time: current_time,
            end_time,
            active: true,
        };
        
        // Add subscription to platform
        if (table::contains(&platform.subscribers, subscriber)) {
            // Remove old subscription if exists
            let old_sub_id = table::remove(&mut platform.subscribers, subscriber);
            // Would need handling for old subscription object
        }
        
        table::add(&mut platform.subscribers, subscriber, object::id(&subscription));
        
        // Emit subscription event
        event::emit(SubscriptionCreated {
            subscription_id: object::id(&subscription),
            subscriber,
            subscription_type: string::utf8(subscription_type),
            duration_days,
            amount: price,
        });
        
        // Transfer subscription to user
        transfer::transfer(subscription, subscriber);
    }

    // Calculate subscription price based on duration
    fun calculate_subscription_price(duration_days: u64): u64 {
        if (duration_days == 30) {
            // 1 month - 1 SUI
            1_000_000_000 // 1 SUI in MIST
        } else if (duration_days == 90) {
            // 3 months - 2.5 SUI
            2_500_000_000
        } else if (duration_days == 180) {
            // 6 months - 4.5 SUI
            4_500_000_000
        } else {
            // 12 months - 8 SUI
            8_000_000_000
        }
    }

    // Distribute subscription revenue to creators
    public entry fun distribute_revenue(
        platform: &mut StreamingPlatform,
        registry: &ContentRegistry,
        creators: vector<address>,
        amounts: vector<u64>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the platform owner
        assert!(tx_context::sender(ctx) == platform.owner, EUnauthorizedCaller);
        
        // Verify vectors have same length
        assert!(std::vector::length(&creators) == std::vector::length(&amounts), EInvalidInput);
        
        let i = 0;
        let len = std::vector::length(&creators);
        let total_amount = 0;
        
        // Calculate total amount
        while (i < len) {
            total_amount = total_amount + *std::vector::borrow(&amounts, i);
            i = i + 1;
        };
        
        // Verify sufficient balance
        assert!(coin::value(&platform.subscription_revenue) >= total_amount, EInsufficientBalance);
        
        // Distribute to creators
        i = 0;
        while (i < len) {
            let creator = *std::vector::borrow(&creators, i);
            let amount = *std::vector::borrow(&amounts, i);
            
            if (amount > 0) {
                let payment = coin::split(&mut platform.subscription_revenue, amount, ctx);
                transfer::public_transfer(payment, creator);
            };
            
            i = i + 1;
        };
    }

    // Check if user has active subscription
    fun has_active_subscription(platform: &StreamingPlatform, user: address, ctx: &TxContext): bool {
        if (!table::contains(&platform.subscribers, user)) {
            return false
        };
        
        let subscription_id = *table::borrow(&platform.subscribers, user);
        // In a real implementation, this would retrieve the subscription and check its expiration
        // For simplicity, we're returning true here
        true
    }

    // Get content stream count
    public fun get_stream_count(registry: &ContentRegistry, content_id: ID): u64 {
        if (table::contains(&registry.stream_count, content_id)) {
            *table::borrow(&registry.stream_count, content_id)
        } else {
            0
        }
    }

    // Check if content is registered
    public fun is_content_registered(registry: &ContentRegistry, content_id: ID): bool {
        table::contains(&registry.music_content, content_id) || 
        table::contains(&registry.movie_content, content_id)
    }
}
