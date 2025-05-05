module soundwave::tickets {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::dynamic_object_field as dof;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use std::vector;
    use soundwave::nft::{Self, SoundWaveNFT};

    // Error constants
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EEventNotFound: u64 = 2;
    const ETicketNotFound: u64 = 3;
    const EEventSoldOut: u64 = 4;
    const EEventCancelled: u64 = 5;
    const ETicketAlreadyUsed: u64 = 6;
    const EInvalidTicketType: u64 = 7;
    const EInvalidDate: u64 = 8;

    // Events
    struct EventCreated has copy, drop {
        event_id: ID,
        organizer: address,
        title: String,
        date: u64,
        venue: String,
        total_tickets: u64,
    }

    struct TicketPurchased has copy, drop {
        ticket_id: ID,
        event_id: ID,
        buyer: address,
        price: u64,
        ticket_type: String,
    }

    struct TicketTransferred has copy, drop {
        ticket_id: ID,
        from: address,
        to: address,
    }

    struct TicketUsed has copy, drop {
        ticket_id: ID,
        event_id: ID,
        user: address,
        timestamp: u64,
    }

    struct EventCancelled has copy, drop {
        event_id: ID,
        organizer: address,
        refund_amount: u64,
    }

    // Event structure
    struct Event has key {
        id: UID,
        organizer: address,
        title: String,
        description: String,
        date: u64,
        venue: String,
        image_url: String,
        total_tickets: u64,
        available_tickets: u64,
        ticket_types: vector<TicketType>,
        is_cancelled: bool,
    }

    // Ticket type structure
    struct TicketType has store, copy, drop {
        name: String,
        price: u64,
        quantity: u64,
        available: u64,
        benefits: String,
    }

    // Ticket registry
    struct TicketRegistry has key {
        id: UID,
        owner: address,
        events: Table<ID, ID>,
        tickets: Table<ID, ID>,
        platform_fee_percentage: u64,
    }

    // Initialize the ticket registry
    fun init(ctx: &mut TxContext) {
        let registry = TicketRegistry {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            events: table::new(ctx),
            tickets: table::new(ctx),
            platform_fee_percentage: 250, // 2.5%
        };

        transfer::share_object(registry);
    }

    // Create a new event
    public entry fun create_event(
        registry: &mut TicketRegistry,
        title: vector<u8>,
        description: vector<u8>,
        date: u64,
        venue: vector<u8>,
        image_url: vector<u8>,
        total_tickets: u64,
        ticket_type_names: vector<vector<u8>>,
        ticket_type_prices: vector<u64>,
        ticket_type_quantities: vector<u64>,
        ticket_type_benefits: vector<vector<u8>>,
        ctx: &mut TxContext
    ) {
        // Validate date (must be in the future)
        assert!(date > tx_context::epoch_timestamp_ms(ctx), EInvalidDate);
        
        // Validate ticket types
        let num_ticket_types = vector::length(&ticket_type_names);
        assert!(
            num_ticket_types == vector::length(&ticket_type_prices) &&
            num_ticket_types == vector::length(&ticket_type_quantities) &&
            num_ticket_types == vector::length(&ticket_type_benefits),
            EInvalidTicketType
        );
        
        // Create ticket types
        let ticket_types = vector::empty<TicketType>();
        let i = 0;
        let total_quantity = 0;
        
        while (i < num_ticket_types) {
            let name = *vector::borrow(&ticket_type_names, i);
            let price = *vector::borrow(&ticket_type_prices, i);
            let quantity = *vector::borrow(&ticket_type_quantities, i);
            let benefits = *vector::borrow(&ticket_type_benefits, i);
            
            vector::push_back(&mut ticket_types, TicketType {
                name: string::utf8(name),
                price,
                quantity,
                available: quantity,
                benefits: string::utf8(benefits),
            });
            
            total_quantity = total_quantity + quantity;
            i = i + 1;
        };
        
        // Verify total tickets matches sum of ticket type quantities
        assert!(total_tickets == total_quantity, EInvalidTicketType);
        
        // Create event
        let event_id = object::new(ctx);
        let event = Event {
            id: event_id,
            organizer: tx_context::sender(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            date,
            venue: string::utf8(venue),
            image_url: string::utf8(image_url),
            total_tickets,
            available_tickets: total_tickets,
            ticket_types,
            is_cancelled: false,
        };
        
        // Add event to registry
        table::add(&mut registry.events, object::id(&event), object::id(&event));
        
        // Emit event created event
        event::emit(EventCreated {
            event_id: object::id(&event),
            organizer: tx_context::sender(ctx),
            title: string::utf8(title),
            date,
            venue: string::utf8(venue),
            total_tickets,
        });
        
        // Share the event object
        transfer::share_object(event);
    }

    // Purchase a ticket
    public entry fun purchase_ticket(
        registry: &mut TicketRegistry,
        event: &mut Event,
        ticket_type_index: u64,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify event exists and is not cancelled
        assert!(table::contains(&registry.events, object::id(event)), EEventNotFound);
        assert!(!event.is_cancelled, EEventCancelled);
        
        // Verify event has available tickets
        assert!(event.available_tickets > 0, EEventSoldOut);
        
        // Verify ticket type exists and has available tickets
        assert!(ticket_type_index < vector::length(&event.ticket_types), EInvalidTicketType);
        let ticket_type = vector::borrow_mut(&mut event.ticket_types, ticket_type_index);
        assert!(ticket_type.available > 0, EEventSoldOut);
        
        // Verify payment amount
        assert!(coin::value(payment) >= ticket_type.price, EInsufficientBalance);
        
        // Calculate platform fee
        let platform_fee = (ticket_type.price * registry.platform_fee_percentage) / 10000;
        let organizer_amount = ticket_type.price - platform_fee;
        
        // Split coins for payment
        let platform_fee_payment = coin::split(payment, platform_fee, ctx);
        let organizer_payment = coin::split(payment, organizer_amount, ctx);
        
        // Transfer fee to registry owner
        transfer::public_transfer(platform_fee_payment, registry.owner);
        
        // Transfer payment to event organizer
        transfer::public_transfer(organizer_payment, event.organizer);
        
        // Update ticket availability
        ticket_type.available = ticket_type.available - 1;
        event.available_tickets = event.available_tickets - 1;
        
        // Create NFT ticket
        let ticket_metadata = vector::empty<u8>();
        // In a real implementation, we would add ticket details to metadata
        
        let nft = nft::mint_nft(
            string::bytes(event.title),
            string::bytes(event.description),
            string::bytes(event.image_url),
            b"ticket",
            0, // No royalties for tickets
            1, // Edition 1
            1, // Max edition 1
            ticket_metadata,
            ctx
        );
        
        // Add ticket to registry
        let ticket_id = object::id(&nft);
        table::add(&mut registry.tickets, ticket_id, object::id(event));
        
        // Emit ticket purchased event
        event::emit(TicketPurchased {
            ticket_id,
            event_id: object::id(event),
            buyer: tx_context::sender(ctx),
            price: ticket_type.price,
            ticket_type: ticket_type.name,
        });
        
        // Transfer ticket to buyer
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // Transfer a ticket
    public entry fun transfer_ticket(
        registry: &TicketRegistry,
        ticket: SoundWaveNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let ticket_id = object::id(&ticket);
        
        // Verify ticket exists in registry
        assert!(table::contains(&registry.tickets, ticket_id), ETicketNotFound);
        
        // Verify caller owns the ticket
        assert!(tx_context::sender(ctx) == nft::get_nft_info(&ticket).4, EUnauthorizedCaller);
        
        // Emit ticket transferred event
        event::emit(TicketTransferred {
            ticket_id,
            from: tx_context::sender(ctx),
            to: recipient,
        });
        
        // Transfer ticket to recipient
        transfer::public_transfer(ticket, recipient);
    }

    // Use a ticket (mark as used)
    public entry fun use_ticket(
        registry: &TicketRegistry,
        event: &Event,
        ticket: &mut SoundWaveNFT,
        ctx: &mut TxContext
    ) {
        let ticket_id = object::id(ticket);
        
        // Verify ticket exists in registry and is for this event
        assert!(table::contains(&registry.tickets, ticket_id), ETicketNotFound);
        let event_id = *table::borrow(&registry.tickets, ticket_id);
        assert!(event_id == object::id(event), ETicketNotFound);
        
        // Verify caller is the event organizer
        assert!(tx_context::sender(ctx) == event.organizer, EUnauthorizedCaller);
        
        // In a real implementation, we would mark the ticket as used
        // For simplicity, we'll just emit an event
        
        // Emit ticket used event
        event::emit(TicketUsed {
            ticket_id,
            event_id: object::id(event),
            user: nft::get_nft_info(ticket).4, // ticket owner
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Cancel an event
    public entry fun cancel_event(
        registry: &mut TicketRegistry,
        event: &mut Event,
        refund_coin: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the event organizer
        assert!(tx_context::sender(ctx) == event.organizer, EUnauthorizedCaller);
        
        // Mark event as cancelled
        event.is_cancelled = true;
        
        // Calculate refund amount (in a real implementation, this would be more complex)
        let sold_tickets = event.total_tickets - event.available_tickets;
        let refund_amount = coin::value(refund_coin);
        
        // Emit event cancelled event
        event::emit(EventCancelled {
            event_id: object::id(event),
            organizer: event.organizer,
            refund_amount,
        });
        
        // In a real implementation, we would process refunds to ticket holders
    }

    // Get event information
    public fun get_event_info(event: &Event): (
        address, String, String, u64, String, String, u64, u64, bool
    ) {
        (
            event.organizer,
            event.title,
            event.description,
            event.date,
            event.venue,
            event.image_url,
            event.total_tickets,
            event.available_tickets,
            event.is_cancelled
        )
    }

    // Get ticket type information
    public fun get_ticket_types(event: &Event): vector<TicketType> {
        event.ticket_types
    }

    // Check if ticket is valid for an event
    public fun is_ticket_valid(registry: &TicketRegistry, ticket_id: ID, event_id: ID): bool {
        if (!table::contains(&registry.tickets, ticket_id)) {
            return false
        };
        
        let ticket_event_id = *table::borrow(&registry.tickets, ticket_id);
        ticket_event_id == event_id
    }
}
