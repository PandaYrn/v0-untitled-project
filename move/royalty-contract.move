module soundwave::royalty {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::url::{Self, Url};
    use std::string::{Self, String};

    // Errors
    const EInsufficientBalance: u64 = 0;
    const EInvalidRoyaltyPercentage: u64 = 1;
    const EUnauthorizedCaller: u64 = 2;
    const EAssetNotFound: u64 = 3;

    // Events
    struct RoyaltyPaid has copy, drop {
        asset_id: ID,
        creator: address,
        amount: u64,
        payer: address,
    }

    // Asset types
    struct MusicAsset has key, store {
        id: UID,
        title: String,
        artist: String,
        creator: address,
        royalty_percentage: u64,
        url: Url,
        description: String,
    }

    struct MovieAsset has key, store {
        id: UID,
        title: String,
        director: String,
        creator: address,
        royalty_percentage: u64,
        url: Url,
        description: String,
    }

    struct NFTAsset has key, store {
        id: UID,
        title: String,
        creator: address,
        royalty_percentage: u64,
        url: Url,
        description: String,
        edition: String,
    }

    struct TicketAsset has key, store {
        id: UID,
        event_title: String,
        event_date: String,
        venue: String,
        creator: address,
        royalty_percentage: u64,
        url: Url,
        ticket_type: String,
    }

    // Create a new music asset
    public entry fun create_music_asset(
        title: vector<u8>,
        artist: vector<u8>,
        royalty_percentage: u64,
        url_string: vector<u8>,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate royalty percentage (0-20%)
        assert!(royalty_percentage <= 2000, EInvalidRoyaltyPercentage);

        let id = object::new(ctx);
        let music_asset = MusicAsset {
            id,
            title: string::utf8(title),
            artist: string::utf8(artist),
            creator: tx_context::sender(ctx),
            royalty_percentage,
            url: url::new_unsafe_from_bytes(url_string),
            description: string::utf8(description),
        };

        transfer::transfer(music_asset, tx_context::sender(ctx));
    }

    // Create a new movie asset
    public entry fun create_movie_asset(
        title: vector<u8>,
        director: vector<u8>,
        royalty_percentage: u64,
        url_string: vector<u8>,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate royalty percentage (0-20%)
        assert!(royalty_percentage <= 2000, EInvalidRoyaltyPercentage);

        let id = object::new(ctx);
        let movie_asset = MovieAsset {
            id,
            title: string::utf8(title),
            director: string::utf8(director),
            creator: tx_context::sender(ctx),
            royalty_percentage,
            url: url::new_unsafe_from_bytes(url_string),
            description: string::utf8(description),
        };

        transfer::transfer(movie_asset, tx_context::sender(ctx));
    }

    // Create a new NFT asset
    public entry fun create_nft_asset(
        title: vector<u8>,
        royalty_percentage: u64,
        url_string: vector<u8>,
        description: vector<u8>,
        edition: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate royalty percentage (0-20%)
        assert!(royalty_percentage <= 2000, EInvalidRoyaltyPercentage);

        let id = object::new(ctx);
        let nft_asset = NFTAsset {
            id,
            title: string::utf8(title),
            creator: tx_context::sender(ctx),
            royalty_percentage,
            url: url::new_unsafe_from_bytes(url_string),
            description: string::utf8(description),
            edition: string::utf8(edition),
        };

        transfer::transfer(nft_asset, tx_context::sender(ctx));
    }

    // Create a new ticket asset
    public entry fun create_ticket_asset(
        event_title: vector<u8>,
        event_date: vector<u8>,
        venue: vector<u8>,
        royalty_percentage: u64,
        url_string: vector<u8>,
        ticket_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate royalty percentage (0-20%)
        assert!(royalty_percentage <= 2000, EInvalidRoyaltyPercentage);

        let id = object::new(ctx);
        let ticket_asset = TicketAsset {
            id,
            event_title: string::utf8(event_title),
            event_date: string::utf8(event_date),
            venue: string::utf8(venue),
            creator: tx_context::sender(ctx),
            royalty_percentage,
            url: url::new_unsafe_from_bytes(url_string),
            ticket_type: string::utf8(ticket_type),
        };

        transfer::transfer(ticket_asset, tx_context::sender(ctx));
    }

    // Pay royalties for a music asset
    public entry fun pay_music_royalty(
        asset: &MusicAsset, 
        payment: &mut Coin<SUI>, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        // Check if payment has sufficient balance
        assert!(coin::value(payment) >= amount, EInsufficientBalance);

        // Calculate royalty amount
        let royalty_amount = (amount * asset.royalty_percentage) / 10000;
        
        // Split coin and transfer royalty to creator
        let royalty_coin = coin::split(payment, royalty_amount, ctx);
        transfer::public_transfer(royalty_coin, asset.creator);
        
        // Emit royalty payment event
        event::emit(RoyaltyPaid {
            asset_id: object::id(asset),
            creator: asset.creator,
            amount: royalty_amount,
            payer: tx_context::sender(ctx),
        });
    }

    // Functions for paying royalties for other asset types would be similar

    // Get music asset info
    public fun get_music_info(asset: &MusicAsset): (String, String, address, u64, Url, String) {
        (
            asset.title,
            asset.artist,
            asset.creator,
            asset.royalty_percentage,
            asset.url,
            asset.description
        )
    }

    // Get movie asset info
    public fun get_movie_info(asset: &MovieAsset): (String, String, address, u64, Url, String) {
        (
            asset.title,
            asset.director,
            asset.creator,
            asset.royalty_percentage,
            asset.url,
            asset.description
        )
    }

    // Get NFT asset info
    public fun get_nft_info(asset: &NFTAsset): (String, address, u64, Url, String, String) {
        (
            asset.title,
            asset.creator,
            asset.royalty_percentage,
            asset.url,
            asset.description,
            asset.edition
        )
    }

    // Get ticket asset info
    public fun get_ticket_info(asset: &TicketAsset): (String, String, String, address, u64, Url, String) {
        (
            asset.event_title,
            asset.event_date,
            asset.venue,
            asset.creator,
            asset.royalty_percentage,
            asset.url,
            asset.ticket_type
        )
    }
}
