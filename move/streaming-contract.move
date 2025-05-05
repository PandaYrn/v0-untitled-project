module soundwave::streaming {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use soundwave::royalty::{Self, MusicAsset, MovieAsset};

    // Errors
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EAssetNotFound: u64 = 2;
    const EInvalidSubscriptionPeriod: u64 = 3;

    // Events
    struct StreamingPayment has copy, drop {
        asset_id: ID,
        creator: address,
        amount: u64,
        consumer: address,
    }

    struct SubscriptionCreated has copy, drop {
        subscriber: address,
        subscription_type: String,
        duration_days: u64,
        amount: u64,
    }

    // Subscription types
    struct UserSubscription has key {
        id: UID,
        subscriber: address,
        subscription_type: String,
        expiration_epoch: u64,
        active: bool,
    }

    // Streaming platform data structure
    struct StreamingPlatform has key {
        id: UID,
        owner: address,
        platform_fee_percentage: u64,
        music_assets: Table<ID, address>,
        movie_assets: Table<ID, address>,
        subscribers: Table<address, ID>,
    }

    // Initialize the streaming platform
    fun init(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let streaming_platform = StreamingPlatform {
            id,
            owner: tx_context::sender(ctx),
            platform_fee_percentage: 200, // 2%
            music_assets: table::new(ctx),
            movie_assets: table::new(ctx),
            subscribers: table::new(ctx),
        };

        transfer::share_object(streaming_platform);
    }

    // Register a music asset for streaming
    public entry fun register_music_for_streaming(
        platform: &mut StreamingPlatform,
        asset: &MusicAsset,
        ctx: &mut TxContext
    ) {
        let asset_id = object::id(asset);
        let creator = tx_context::sender(ctx);
        
        // Add asset to platform
        table::add(&mut platform.music_assets, asset_id, creator);
    }

    // Register a movie asset for streaming
    public entry fun register_movie_for_streaming(
        platform: &mut StreamingPlatform,
        asset: &MovieAsset,
        ctx: &mut TxContext
    ) {
        let asset_id = object::id(asset);
        let creator = tx_context::sender(ctx);
        
        // Add asset to platform
        table::add(&mut platform.movie_assets, asset_id, creator);
    }

    // Stream a music asset and pay royalty
    public entry fun stream_music(
        platform: &mut StreamingPlatform,
        asset: &MusicAsset,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Verify asset is registered
        assert!(table::contains(&platform.music_assets, object::id(asset)), EAssetNotFound);
        
        // Check if user has an active subscription
        let sender = tx_context::sender(ctx);
        let has_subscription = table::contains(&platform.subscribers, sender) &&
                              has_active_subscription(platform, sender, ctx);
        
        // If no subscription, process payment
        if (!has_subscription) {
            // Check if payment has sufficient balance
            assert!(coin::value(payment) >= amount, EInsufficientBalance);

            // Calculate platform fee
            let platform_fee = (amount * platform.platform_fee_percentage) / 10000;
            let royalty_amount = amount - platform_fee;
            
            // Split coin and transfer fee to platform owner
            let fee_coin = coin::split(payment, platform_fee, ctx);
            transfer::public_transfer(fee_coin, platform.owner);
            
            // Pay royalty to creator
            royalty::pay_music_royalty(asset, payment, royalty_amount, ctx);
            
            // Emit streaming payment event
            event::emit(StreamingPayment {
                asset_id: object::id(asset),
                creator: royalty::get_music_info(asset).2, // creator address
                amount: royalty_amount,
                consumer: sender,
            });
        }
        
        // If user has subscription, royalty is paid from subscription pool (would be implemented separately)
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
        
        // Split coin and transfer payment to platform owner
        let subscription_payment = coin::split(payment, price, ctx);
        transfer::public_transfer(subscription_payment, platform.owner);
        
        // Create user subscription
        let subscriber = tx_context::sender(ctx);
        let current_epoch = tx_context::epoch(ctx);
        let expiration_epoch = current_epoch + (duration_days * 24 * 60 * 60 / 30); // Approximate epoch calculation
        
        let subscription_id = object::new(ctx);
        let subscription = UserSubscription {
            id: subscription_id,
            subscriber,
            subscription_type: string::utf8(subscription_type),
            expiration_epoch,
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

    // Check if user has active subscription
    fun has_active_subscription(platform: &StreamingPlatform, user: address, ctx: &TxContext): bool {
        if (!table::contains(&platform.subscribers, user)) {
            return false
        }
        
        let subscription_id = *table::borrow(&platform.subscribers, user);
        // In a real implementation, this would retrieve the subscription and check its expiration
        // For simplicity, we're returning true here
        true
    }
}
