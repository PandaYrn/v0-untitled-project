module soundwave::royalty {
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
    const EInvalidRoyaltyPercentage: u64 = 2;
    const EAssetNotFound: u64 = 3;
    const EInvalidDistribution: u64 = 4;

    // Events
    struct RoyaltyPaid has copy, drop {
        content_id: ID,
        creator: address,
        amount: u64,
        payer: address,
        content_type: String,
    }

    struct RoyaltyDistributed has copy, drop {
        content_id: ID,
        recipients: vector<address>,
        amounts: vector<u64>,
        total_amount: u64,
    }

    struct RoyaltyConfigCreated has copy, drop {
        config_id: ID,
        content_id: ID,
        creator: address,
        royalty_percentage: u64,
    }

    // Royalty configuration
    struct RoyaltyConfig has key {
        id: UID,
        content_id: ID,
        creator: address,
        royalty_percentage: u64, // in basis points (e.g., 1000 = 10%)
        recipients: vector<address>,
        shares: vector<u64>, // in basis points, must sum to 10000 (100%)
    }

    // Royalty registry
    struct RoyaltyRegistry has key {
        id: UID,
        owner: address,
        configs: Table<ID, ID>,
        total_royalties_paid: u64,
    }

    // Initialize the royalty registry
    fun init(ctx: &mut TxContext) {
        let registry = RoyaltyRegistry {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            configs: table::new(ctx),
            total_royalties_paid: 0,
        };

        transfer::share_object(registry);
    }

    // Create a royalty configuration
    public entry fun create_royalty_config(
        registry: &mut RoyaltyRegistry,
        nft: &SoundWaveNFT,
        royalty_percentage: u64,
        recipients: vector<address>,
        shares: vector<u64>,
        ctx: &mut TxContext
    ) {
        let content_id = object::id(nft);
        let (_, _, _, _, creator, _, _, _, _, _) = nft::get_nft_info(nft);
        
        // Verify caller is the content creator
        assert!(tx_context::sender(ctx) == creator, EUnauthorizedCaller);
        
        // Validate royalty percentage (max 25%)
        assert!(royalty_percentage <= 2500, EInvalidRoyaltyPercentage);
        
        // Validate recipients and shares
        let num_recipients = std::vector::length(&recipients);
        assert!(num_recipients == std::vector::length(&shares), EInvalidDistribution);
        
        // Verify shares sum to 100%
        let i = 0;
        let total_shares = 0;
        while (i < num_recipients) {
            total_shares = total_shares + *std::vector::borrow(&shares, i);
            i = i + 1;
        };
        assert!(total_shares == 10000, EInvalidDistribution);
        
        // Create royalty config
        let config_id = object::new(ctx);
        let config = RoyaltyConfig {
            id: config_id,
            content_id,
            creator,
            royalty_percentage,
            recipients,
            shares,
        };
        
        // Add config to registry
        table::add(&mut registry.configs, content_id, object::id(&config));
        
        // Emit royalty config created event
        event::emit(RoyaltyConfigCreated {
            config_id: object::id(&config),
            content_id,
            creator,
            royalty_percentage,
        });
        
        // Share the config object
        transfer::share_object(config);
    }

    // Pay royalties
    public entry fun pay_royalty(
        registry: &mut RoyaltyRegistry,
        config: &RoyaltyConfig,
        payment: &mut Coin<SUI>,
        amount: u64,
        content_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify config exists in registry
        assert!(table::contains(&registry.configs, config.content_id), EAssetNotFound);
        
        // Verify payment amount
        assert!(coin::value(payment) >= amount, EInsufficientBalance);
        
        // Calculate royalty amount
        let royalty_amount = (amount * config.royalty_percentage) / 10000;
        
        // If royalty amount is 0, return early
        if (royalty_amount == 0) {
            return
        };
        
        // Split coin for royalty payment
        let royalty_payment = coin::split(payment, royalty_amount, ctx);
        
        // Distribute royalties according to shares
        let num_recipients = std::vector::length(&config.recipients);
        let i = 0;
        
        while (i < num_recipients) {
            let recipient = *std::vector::borrow(&config.recipients, i);
            let share = *std::vector::borrow(&config.shares, i);
            
            let recipient_amount = (royalty_amount * share) / 10000;
            if (recipient_amount > 0) {
                let recipient_payment = coin::split(&mut royalty_payment, recipient_amount, ctx);
                transfer::public_transfer(recipient_payment, recipient);
            };
            
            i = i + 1;
        };
        
        // If there's any remaining amount due to rounding, send to creator
        if (coin::value(&royalty_payment) > 0) {
            transfer::public_transfer(royalty_payment, config.creator);
        };
        
        // Update total royalties paid
        registry.total_royalties_paid = registry.total_royalties_paid + royalty_amount;
        
        // Emit royalty paid event
        event::emit(RoyaltyPaid {
            content_id: config.content_id,
            creator: config.creator,
            amount: royalty_amount,
            payer: tx_context::sender(ctx),
            content_type: string::utf8(content_type),
        });
    }

    // Update royalty configuration (only creator)
    public entry fun update_royalty_config(
        registry: &RoyaltyRegistry,
        config: &mut RoyaltyConfig,
        new_royalty_percentage: u64,
        new_recipients: vector<address>,
        new_shares: vector<u64>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the creator
        assert!(tx_context::sender(ctx) == config.creator, EUnauthorizedCaller);
        
        // Validate royalty percentage (max 25%)
        assert!(new_royalty_percentage <= 2500, EInvalidRoyaltyPercentage);
        
        // Validate recipients and shares
        let num_recipients = std::vector::length(&new_recipients);
        assert!(num_recipients == std::vector::length(&new_shares), EInvalidDistribution);
        
        // Verify shares sum to 100%
        let i = 0;
        let total_shares = 0;
        while (i < num_recipients) {
            total_shares = total_shares + *std::vector::borrow(&new_shares, i);
            i = i + 1;
        };
        assert!(total_shares == 10000, EInvalidDistribution);
        
        // Update config
        config.royalty_percentage = new_royalty_percentage;
        config.recipients = new_recipients;
        config.shares = new_shares;
    }

    // Get royalty configuration
    public fun get_royalty_config(config: &RoyaltyConfig): (
        ID, address, u64, vector<address>, vector<u64>
    ) {
        (
            config.content_id,
            config.creator,
            config.royalty_percentage,
            config.recipients,
            config.shares
        )
    }

    // Calculate royalty amount
    public fun calculate_royalty(config: &RoyaltyConfig, amount: u64): u64 {
        (amount * config.royalty_percentage) / 10000
    }

    // Check if content has royalty config
    public fun has_royalty_config(registry: &RoyaltyRegistry, content_id: ID): bool {
        table::contains(&registry.configs, content_id)
    }
}
