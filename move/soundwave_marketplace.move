module soundwave::marketplace {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::dynamic_object_field as dof;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use soundwave::nft::{Self, SoundWaveNFT};

    // Error constants
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EListingNotFound: u64 = 2;
    const EIncorrectListingPrice: u64 = 3;
    const EInvalidFeePercentage: u64 = 4;
    const EOfferTooLow: u64 = 5;
    const EOfferExpired: u64 = 6;

    // Events
    struct ListingCreated has copy, drop {
        listing_id: ID,
        nft_id: ID,
        seller: address,
        price: u64,
        content_type: String,
    }

    struct ListingPurchased has copy, drop {
        listing_id: ID,
        nft_id: ID,
        seller: address,
        buyer: address,
        price: u64,
        royalty_amount: u64,
        platform_fee: u64,
    }

    struct ListingCancelled has copy, drop {
        listing_id: ID,
        nft_id: ID,
        seller: address,
    }

    struct OfferCreated has copy, drop {
        offer_id: ID,
        nft_id: ID,
        buyer: address,
        amount: u64,
        expiration_time: u64,
    }

    struct OfferAccepted has copy, drop {
        offer_id: ID,
        nft_id: ID,
        seller: address,
        buyer: address,
        amount: u64,
    }

    struct OfferRejected has copy, drop {
        offer_id: ID,
        nft_id: ID,
        seller: address,
        buyer: address,
    }

    // Marketplace data structure
    struct Marketplace has key {
        id: UID,
        owner: address,
        fee_percentage: u64, // in basis points (e.g., 250 = 2.5%)
        listings: Table<ID, ID>,
        offers: Table<ID, ID>,
        total_volume: u64,
        total_sales: u64,
    }

    // Listing structure
    struct Listing has key, store {
        id: UID,
        nft_id: ID,
        seller: address,
        price: u64,
        created_at: u64,
        content_type: String,
    }

    // Offer structure
    struct Offer has key, store {
        id: UID,
        nft_id: ID,
        buyer: address,
        amount: u64,
        created_at: u64,
        expiration_time: u64,
        payment: Coin<SUI>,
    }

    // Initialize the marketplace
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            fee_percentage: 250, // 2.5%
            listings: table::new(ctx),
            offers: table::new(ctx),
            total_volume: 0,
            total_sales: 0,
        };

        transfer::share_object(marketplace);
    }

    // Create a listing
    public entry fun create_listing(
        marketplace: &mut Marketplace,
        nft: SoundWaveNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id(&nft);
        let seller = tx_context::sender(ctx);
        
        // Get NFT info
        let (_, _, _, content_type, _, _, _, _, _, _) = nft::get_nft_info(&nft);
        
        // Create listing
        let listing_id = object::new(ctx);
        let listing = Listing {
            id: listing_id,
            nft_id,
            seller,
            price,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            content_type,
        };
        
        // Store the NFT in the listing
        dof::add(&mut listing.id, b"nft", nft);
        
        // Add listing to marketplace
        table::add(&mut marketplace.listings, nft_id, object::id(&listing));
        
        // Emit listing created event
        event::emit(ListingCreated {
            listing_id: object::id(&listing),
            nft_id,
            seller,
            price,
            content_type,
        });
        
        // Share the listing object
        transfer::share_object(listing);
    }

    // Purchase a listing
    public entry fun purchase_listing(
        marketplace: &mut Marketplace,
        listing: &mut Listing,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify listing exists in marketplace
        assert!(table::contains(&marketplace.listings, listing.nft_id), EListingNotFound);
        
        // Verify payment amount
        assert!(coin::value(payment) >= listing.price, EInsufficientBalance);
        
        // Get the NFT from the listing
        let nft = dof::remove<vector<u8>, SoundWaveNFT>(&mut listing.id, b"nft");
        
        // Get NFT info for royalty calculation
        let (_, _, _, _, creator, royalty_percentage, _, _, _, _) = nft::get_nft_info(&nft);
        
        // Calculate royalty and platform fee
        let royalty_amount = (listing.price * royalty_percentage) / 10000;
        let platform_fee = (listing.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing.price - royalty_amount - platform_fee;
        
        // Split coins for payment
        let royalty_payment = coin::split(payment, royalty_amount, ctx);
        let platform_fee_payment = coin::split(payment, platform_fee, ctx);
        let seller_payment = coin::split(payment, seller_amount, ctx);
        
        // Transfer royalty to creator
        transfer::public_transfer(royalty_payment, creator);
        
        // Transfer fee to marketplace owner
        transfer::public_transfer(platform_fee_payment, marketplace.owner);
        
        // Transfer payment to seller
        transfer::public_transfer(seller_payment, listing.seller);
        
        // Remove the listing from marketplace
        table::remove(&mut marketplace.listings, listing.nft_id);
        
        // Update marketplace stats
        marketplace.total_volume = marketplace.total_volume + listing.price;
        marketplace.total_sales = marketplace.total_sales + 1;
        
        // Transfer NFT to buyer
        transfer::public_transfer(nft, tx_context::sender(ctx));
        
        // Emit purchase event
        event::emit(ListingPurchased {
            listing_id: object::id(listing),
            nft_id: listing.nft_id,
            seller: listing.seller,
            buyer: tx_context::sender(ctx),
            price: listing.price,
            royalty_amount,
            platform_fee,
        });
    }

    // Cancel a listing
    public entry fun cancel_listing(
        marketplace: &mut Marketplace,
        listing: &mut Listing,
        ctx: &mut TxContext
    ) {
        // Verify caller is the seller
        assert!(tx_context::sender(ctx) == listing.seller, EUnauthorizedCaller);
        
        // Remove the listing from marketplace
        table::remove(&mut marketplace.listings, listing.nft_id);
        
        // Get the NFT from the listing
        let nft = dof::remove<vector<u8>, SoundWaveNFT>(&mut listing.id, b"nft");
        
        // Return NFT to seller
        transfer::public_transfer(nft, listing.seller);
        
        // Emit cancellation event
        event::emit(ListingCancelled {
            listing_id: object::id(listing),
            nft_id: listing.nft_id,
            seller: listing.seller,
        });
    }

    // Create an offer for an NFT
    public entry fun create_offer(
        marketplace: &mut Marketplace,
        nft_id: ID,
        amount: u64,
        expiration_time: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify payment amount
        assert!(coin::value(&payment) >= amount, EInsufficientBalance);
        
        // Create offer
        let offer_id = object::new(ctx);
        let offer = Offer {
            id: offer_id,
            nft_id,
            buyer: tx_context::sender(ctx),
            amount,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            expiration_time,
            payment,
        };
        
        // Add offer to marketplace
        if (table::contains(&marketplace.offers, nft_id)) {
            // Handle existing offer (in a real implementation, we would store multiple offers)
            let existing_offer_id = table::remove(&mut marketplace.offers, nft_id);
            // Would need handling for existing offer object
        }
        
        table::add(&mut marketplace.offers, nft_id, object::id(&offer));
        
        // Emit offer created event
        event::emit(OfferCreated {
            offer_id: object::id(&offer),
            nft_id,
            buyer: tx_context::sender(ctx),
            amount,
            expiration_time,
        });
        
        // Share the offer object
        transfer::share_object(offer);
    }

    // Accept an offer
    public entry fun accept_offer(
        marketplace: &mut Marketplace,
        offer: &mut Offer,
        nft: SoundWaveNFT,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id(&nft);
        
        // Verify offer is for this NFT
        assert!(offer.nft_id == nft_id, EListingNotFound);
        
        // Verify offer has not expired
        assert!(tx_context::epoch_timestamp_ms(ctx) <= offer.expiration_time, EOfferExpired);
        
        // Verify caller owns the NFT
        assert!(tx_context::sender(ctx) == nft::get_nft_info(&nft).4, EUnauthorizedCaller);
        
        // Get NFT info for royalty calculation
        let (_, _, _, _, creator, royalty_percentage, _, _, _, _) = nft::get_nft_info(&nft);
        
        // Calculate royalty and platform fee
        let royalty_amount = (offer.amount * royalty_percentage) / 10000;
        let platform_fee = (offer.amount * marketplace.fee_percentage) / 10000;
        let seller_amount = offer.amount - royalty_amount - platform_fee;
        
        // Take payment from offer
        let payment = &mut offer.payment;
        
        // Split coins for payment
        let royalty_payment = coin::split(payment, royalty_amount, ctx);
        let platform_fee_payment = coin::split(payment, platform_fee, ctx);
        
        // Transfer royalty to creator
        transfer::public_transfer(royalty_payment, creator);
        
        // Transfer fee to marketplace owner
        transfer::public_transfer(platform_fee_payment, marketplace.owner);
        
        // Transfer remaining payment to seller
        transfer::public_transfer(coin::extract_all(payment), tx_context::sender(ctx));
        
        // Remove the offer from marketplace
        table::remove(&mut marketplace.offers, nft_id);
        
        // Update marketplace stats
        marketplace.total_volume = marketplace.total_volume + offer.amount;
        marketplace.total_sales = marketplace.total_sales + 1;
        
        // Transfer NFT to buyer
        transfer::public_transfer(nft, offer.buyer);
        
        // Emit offer accepted event
        event::emit(OfferAccepted {
            offer_id: object::id(offer),
            nft_id,
            seller: tx_context::sender(ctx),
            buyer: offer.buyer,
            amount: offer.amount,
        });
    }

    // Reject an offer
    public entry fun reject_offer(
        marketplace: &mut Marketplace,
        offer: &mut Offer,
        ctx: &mut TxContext
    ) {
        // Verify caller owns the NFT or is the offer creator
        let is_nft_owner = false; // In a real implementation, we would check ownership
        let is_offer_creator = tx_context::sender(ctx) == offer.buyer;
        
        assert!(is_nft_owner || is_offer_creator, EUnauthorizedCaller);
        
        // Remove the offer from marketplace
        table::remove(&mut marketplace.offers, offer.nft_id);
        
        // Return payment to buyer
        transfer::public_transfer(coin::extract_all(&mut offer.payment), offer.buyer);
        
        // Emit offer rejected event
        event::emit(OfferRejected {
            offer_id: object::id(offer),
            nft_id: offer.nft_id,
            seller: tx_context::sender(ctx),
            buyer: offer.buyer,
        });
    }

    // Update marketplace fee percentage (only owner)
    public entry fun update_fee_percentage(
        marketplace: &mut Marketplace,
        new_fee_percentage: u64,
        ctx: &mut TxContext
    ) {
        // Verify caller is the marketplace owner
        assert!(tx_context::sender(ctx) == marketplace.owner, EUnauthorizedCaller);
        
        // Update fee percentage (max 5%)
        assert!(new_fee_percentage <= 500, EInvalidFeePercentage);
        marketplace.fee_percentage = new_fee_percentage;
    }

    // Get listing information
    public fun get_listing_info(listing: &Listing): (ID, address, u64, u64, String) {
        (
            listing.nft_id,
            listing.seller,
            listing.price,
            listing.created_at,
            listing.content_type
        )
    }

    // Get offer information
    public fun get_offer_info(offer: &Offer): (ID, address, u64, u64, u64) {
        (
            offer.nft_id,
            offer.buyer,
            offer.amount,
            offer.created_at,
            offer.expiration_time
        )
    }

    // Get marketplace statistics
    public fun get_marketplace_stats(marketplace: &Marketplace): (u64, u64, u64) {
        (
            marketplace.fee_percentage,
            marketplace.total_volume,
            marketplace.total_sales
        )
    }
}
