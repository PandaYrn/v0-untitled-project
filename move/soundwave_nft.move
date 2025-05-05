module soundwave::nft {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::event;
    use sui::package;
    use sui::display;
    use std::string::{Self, String};
    use std::vector;

    // Error constants
    const EInvalidRoyaltyPercentage: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EInvalidEditionNumber: u64 = 2;

    // One-time witness for the package
    struct SOUNDWAVE_NFT has drop {}

    // Events
    struct NFTMinted has copy, drop {
        nft_id: ID,
        creator: address,
        content_type: String,
        name: String,
        edition: u64,
        max_editions: u64
    }

    struct NFTTransferred has copy, drop {
        nft_id: ID,
        from: address,
        to: address
    }

    // Base NFT structure
    struct SoundWaveNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        content_type: String, // "music", "movie", "artwork", "ticket"
        creator: address,
        royalty_percentage: u64, // in basis points (e.g., 1000 = 10%)
        creation_timestamp: u64,
        edition: u64,
        max_editions: u64,
        metadata: vector<u8>, // Additional metadata in JSON format
    }

    // Collection to track editions
    struct NFTCollection has key {
        id: UID,
        creator: address,
        name: String,
        description: String,
        current_edition: u64,
        max_editions: u64,
        content_type: String,
    }

    // Initialize the module
    fun init(witness: SOUNDWAVE_NFT, ctx: &mut TxContext) {
        // Create the Display for SoundWaveNFT
        let publisher = package::claim(witness, ctx);
        
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"creator"),
            string::utf8(b"content_type"),
            string::utf8(b"edition"),
            string::utf8(b"project_url")
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}"),
            string::utf8(b"{creator}"),
            string::utf8(b"{content_type}"),
            string::utf8(b"Edition {edition} of {max_editions}"),
            string::utf8(b"https://soundwave.io")
        ];
        
        let display = display::new_with_fields<SoundWaveNFT>(
            &publisher, keys, values, ctx
        );
        
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    // Create a new NFT collection
    public entry fun create_collection(
        name: vector<u8>,
        description: vector<u8>,
        max_editions: u64,
        content_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        let collection = NFTCollection {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            current_edition: 0,
            max_editions,
            content_type: string::utf8(content_type),
        };
        
        transfer::transfer(collection, tx_context::sender(ctx));
    }

    // Mint a new NFT
    public entry fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        url_string: vector<u8>,
        content_type: vector<u8>,
        royalty_percentage: u64,
        edition: u64,
        max_editions: u64,
        metadata: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate royalty percentage (max 25%)
        assert!(royalty_percentage <= 2500, EInvalidRoyaltyPercentage);
        
        // Validate edition number
        assert!(edition > 0 && edition <= max_editions, EInvalidEditionNumber);
        
        let nft = SoundWaveNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            url: url::new_unsafe_from_bytes(url_string),
            content_type: string::utf8(content_type),
            creator: tx_context::sender(ctx),
            royalty_percentage,
            creation_timestamp: tx_context::epoch_timestamp_ms(ctx),
            edition,
            max_editions,
            metadata,
        };
        
        // Emit mint event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            creator: tx_context::sender(ctx),
            content_type: string::utf8(content_type),
            name: string::utf8(name),
            edition,
            max_editions
        });
        
        transfer::transfer(nft, tx_context::sender(ctx));
    }

    // Mint an NFT from a collection
    public entry fun mint_from_collection(
        collection: &mut NFTCollection,
        name: vector<u8>,
        description: vector<u8>,
        url_string: vector<u8>,
        royalty_percentage: u64,
        metadata: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the collection creator
        assert!(tx_context::sender(ctx) == collection.creator, EUnauthorizedCaller);
        
        // Verify collection has not reached max editions
        assert!(collection.current_edition < collection.max_editions, EInvalidEditionNumber);
        
        // Increment edition counter
        collection.current_edition = collection.current_edition + 1;
        
        // Mint the NFT
        let nft = SoundWaveNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            url: url::new_unsafe_from_bytes(url_string),
            content_type: collection.content_type,
            creator: collection.creator,
            royalty_percentage,
            creation_timestamp: tx_context::epoch_timestamp_ms(ctx),
            edition: collection.current_edition,
            max_editions: collection.max_editions,
            metadata,
        };
        
        // Emit mint event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            creator: collection.creator,
            content_type: collection.content_type,
            name: string::utf8(name),
            edition: collection.current_edition,
            max_editions: collection.max_editions
        });
        
        transfer::transfer(nft, collection.creator);
    }

    // Transfer an NFT
    public entry fun transfer_nft(
        nft: SoundWaveNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Emit transfer event
        event::emit(NFTTransferred {
            nft_id: object::id(&nft),
            from: sender,
            to: recipient
        });
        
        transfer::transfer(nft, recipient);
    }

    // Get NFT information
    public fun get_nft_info(nft: &SoundWaveNFT): (
        String, String, Url, String, address, u64, u64, u64, u64, vector<u8>
    ) {
        (
            nft.name,
            nft.description,
            nft.url,
            nft.content_type,
            nft.creator,
            nft.royalty_percentage,
            nft.creation_timestamp,
            nft.edition,
            nft.max_editions,
            nft.metadata
        )
    }

    // Get collection information
    public fun get_collection_info(collection: &NFTCollection): (
        address, String, String, u64, u64, String
    ) {
        (
            collection.creator,
            collection.name,
            collection.description,
            collection.current_edition,
            collection.max_editions,
            collection.content_type
        )
    }
}
