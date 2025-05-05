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
    use soundwave::royalty::{Self, MusicAsset, MovieAsset, NFTAsset, TicketAsset};

    // Errors
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EListingNotFound: u64 = 2;
    const EIncorrectListingPrice: u64 = 3;

    // Events
    struct ListingCreated has copy, drop {
        listing_id: ID,
        asset_id: ID,
        seller: address,
        price: u64,
        listing_type: String,
    }

    struct ListingPurchased has copy, drop {
        listing_id: ID,
        asset_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    struct ListingCancelled has copy, drop {
        listing_id: ID,
        asset_id: ID,
        seller: address,
    }

    // Marketplace data structure
    struct Marketplace has key {
        id: UID,
        owner: address,
        fee_percentage: u64, // in basis points (e.g., 250 = 2.5%)
        music_listings: Table<ID, ID>,
        movie_listings: Table<ID, ID>,
        nft_listings: Table<ID, ID>,
        ticket_listings: Table<ID, ID>,
    }

    // Listing types
    struct MusicListing has key, store {
        id: UID,
        asset_id: ID,
        seller: address,
        price: u64,
    }

    struct MovieListing has key, store {
        id: UID,
        asset_id: ID,
        seller: address,
        price: u64,
    }

    struct NFTListing has key, store {
        id: UID,
        asset_id: ID,
        seller: address,
        price: u64,
    }

    struct TicketListing has key, store {
        id: UID,
        asset_id: ID,
        seller: address,
        price: u64,
    }

    // Initialize the marketplace
    fun init(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let marketplace = Marketplace {
            id,
            owner: tx_context::sender(ctx),
            fee_percentage: 250, // 2.5%
            music_listings: table::new(ctx),
            movie_listings: table::new(ctx),
            nft_listings: table::new(ctx),
            ticket_listings: table::new(ctx),
        };

        transfer::share_object(marketplace);
    }

    // List a music asset for sale
    public entry fun list_music_asset(
        marketplace: &mut Marketplace,
        asset: MusicAsset,
        price: u64,
        ctx: &mut TxContext
    ) {
        let asset_id = object::id(&asset);
        let seller = tx_context::sender(ctx);

        // Create listing
        let listing_id = object::new(ctx);
        let listing = MusicListing {
            id: listing_id,
            asset_id,
            seller,
            price,
        };

        // Store the asset in the listing
        dof::add(&mut listing.id, b"asset", asset);

        // Add listing to marketplace
        table::add(&mut marketplace.music_listings, asset_id, object::id(&listing));

        // Emit event
        event::emit(ListingCreated {
            listing_id: object::id(&listing),
            asset_id,
            seller,
            price,
            listing_type: string::utf8(b"music"),
        });

        // Share the listing object
        transfer::share_object(listing);
    }

    // Similar functions for listing movie, NFT, and ticket assets

    // Purchase a music listing
    public entry fun purchase_music_listing(
        marketplace: &mut Marketplace,
        listing: &mut MusicListing,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify listing exists in marketplace
        assert!(table::contains(&marketplace.music_listings, listing.asset_id), EListingNotFound);
        
        // Verify payment amount
        assert!(coin::value(payment) >= listing.price, EInsufficientBalance);

        // Calculate marketplace fee
        let fee_amount = (listing.price * marketplace.fee_percentage) / 10000;
        let seller_amount = listing.price - fee_amount;

        // Split coins for payment
        let marketplace_fee = coin::split(payment, fee_amount, ctx);
        let seller_payment = coin::split(payment, seller_amount, ctx);

        // Transfer fee to marketplace owner
        transfer::public_transfer(marketplace_fee, marketplace.owner);

        // Transfer payment to seller
        transfer::public_transfer(seller_payment, listing.seller);

        // Remove the listing from marketplace
        table::remove(&mut marketplace.music_listings, listing.asset_id);

        // Take the asset from the listing
        let asset = dof::remove<vector<u8>, MusicAsset>(&mut listing.id, b"asset");

        // Transfer asset to buyer
        transfer::public_transfer(asset, tx_context::sender(ctx));

        // Emit purchase event
        event::emit(ListingPurchased {
            listing_id: object::id(listing),
            asset_id: listing.asset_id,
            seller: listing.seller,
            buyer: tx_context::sender(ctx),
            price: listing.price,
        });
    }

    // Similar functions for purchasing movie, NFT, and ticket listings

    // Cancel a music listing
    public entry fun cancel_music_listing(
        marketplace: &mut Marketplace,
        listing: &mut MusicListing,
        ctx: &mut TxContext
    ) {
        // Verify caller is the seller
        assert!(tx_context::sender(ctx) == listing.seller, EUnauthorizedCaller);

        // Remove the listing from marketplace
        table::remove(&mut marketplace.music_listings, listing.asset_id);

        // Take the asset from the listing
        let asset = dof::remove<vector<u8>, MusicAsset>(&mut listing.id, b"asset");

        // Return asset to seller
        transfer::public_transfer(asset, listing.seller);

        // Emit cancellation event
        event::emit(ListingCancelled {
            listing_id: object::id(listing),
            asset_id: listing.asset_id,
            seller: listing.seller,
        });
    }

    // Similar functions for cancelling movie, NFT, and ticket listings

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

    // Utility functions to get listing information
    public fun get_music_listing_info(listing: &MusicListing): (ID, address, u64) {
        (listing.asset_id, listing.seller, listing.price)
    }

    public fun get_movie_listing_info(listing: &MovieListing): (ID, address, u64) {
        (listing.asset_id, listing.seller, listing.price)
    }

    public fun get_nft_listing_info(listing: &NFTListing): (ID, address, u64) {
        (listing.asset_id, listing.seller, listing.price)
    }

    public fun get_ticket_listing_info(listing: &TicketListing): (ID, address, u64) {
        (listing.asset_id, listing.seller, listing.price)
    }
}
