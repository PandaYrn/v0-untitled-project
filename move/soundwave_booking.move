module soundwave::booking {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use std::vector;

    // Error constants
    const EInsufficientBalance: u64 = 0;
    const EUnauthorizedCaller: u64 = 1;
    const EArtistNotFound: u64 = 2;
    const EBookingNotFound: u64 = 3;
    const EInvalidDate: u64 = 4;
    const EArtistUnavailable: u64 = 5;
    const EBookingAlreadyConfirmed: u64 = 6;
    const EBookingAlreadyCancelled: u64 = 7;
    const EInvalidFeePercentage: u64 = 8;

    // Events
    struct ArtistRegistered has copy, drop {
        artist_id: ID,
        artist_address: address,
        name: String,
        genre: String,
    }

    struct BookingRequested has copy, drop {
        booking_id: ID,
        artist_id: ID,
        requester: address,
        event_date: u64,
        venue: String,
        fee: u64,
    }

    struct BookingConfirmed has copy, drop {
        booking_id: ID,
        artist_id: ID,
        requester: address,
        event_date: u64,
    }

    struct BookingCancelled has copy, drop {
        booking_id: ID,
        artist_id: ID,
        requester: address,
        cancellation_fee: u64,
    }

    struct BookingCompleted has copy, drop {
        booking_id: ID,
        artist_id: ID,
        requester: address,
        event_date: u64,
    }

    // Artist profile
    struct Artist has key {
        id: UID,
        address: address,
        name: String,
        description: String,
        genre: String,
        image_url: String,
        booking_fee: u64,
        is_verified: bool,
        availability: Table<u64, bool>, // date -> available
        rating: u64, // out of 100 (e.g., 95 = 4.95 stars)
        total_bookings: u64,
    }

    // Booking request
    struct Booking has key {
        id: UID,
        artist_id: ID,
        requester: address,
        event_name: String,
        event_description: String,
        event_date: u64,
        venue: String,
        fee: u64,
        deposit_amount: u64,
        deposit_paid: bool,
        is_confirmed: bool,
        is_completed: bool,
        is_cancelled: bool,
        cancellation_fee_percentage: u64, // in basis points
    }

    // Booking platform
    struct BookingPlatform has key {
        id: UID,
        owner: address,
        platform_fee_percentage: u64,
        artists: Table<ID, address>,
        bookings: Table<ID, ID>,
        escrow: Coin<SUI>,
    }

    // Initialize the booking platform
    fun init(ctx: &mut TxContext) {
        let platform = BookingPlatform {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            platform_fee_percentage: 500, // 5%
            artists: table::new(ctx),
            bookings: table::new(ctx),
            escrow: coin::zero<SUI>(ctx),
        };

        transfer::share_object(platform);
    }

    // Register as an artist
    public entry fun register_artist(
        platform: &mut BookingPlatform,
        name: vector<u8>,
        description: vector<u8>,
        genre: vector<u8>,
        image_url: vector<u8>,
        booking_fee: u64,
        ctx: &mut TxContext
    ) {
        let artist_id = object::new(ctx);
        let artist = Artist {
            id: artist_id,
            address: tx_context::sender(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            genre: string::utf8(genre),
            image_url: string::utf8(image_url),
            booking_fee,
            is_verified: false, // Artists start unverified
            availability: table::new(ctx),
            rating: 0,
            total_bookings: 0,
        };
        
        // Add artist to platform
        table::add(&mut platform.artists, object::id(&artist), tx_context::sender(ctx));
        
        // Emit artist registered event
        event::emit(ArtistRegistered {
            artist_id: object::id(&artist),
            artist_address: tx_context::sender(ctx),
            name: string::utf8(name),
            genre: string::utf8(genre),
        });
        
        // Transfer artist profile to creator
        transfer::share_object(artist);
    }

    // Update artist availability
    public entry fun update_availability(
        platform: &BookingPlatform,
        artist: &mut Artist,
        dates: vector<u64>,
        available: vector<bool>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the artist
        assert!(tx_context::sender(ctx) == artist.address, EUnauthorizedCaller);
        
        // Verify vectors have same length
        assert!(vector::length(&dates) == vector::length(&available), EInvalidInput);
        
        // Update availability for each date
        let i = 0;
        let len = vector::length(&dates);
        
        while (i < len) {
            let date = *vector::borrow(&dates, i);
            let is_available = *vector::borrow(&available, i);
            
            if (table::contains(&artist.availability, date)) {
                let availability = table::borrow_mut(&mut artist.availability, date);
                *availability = is_available;
            } else {
                table::add(&mut artist.availability, date, is_available);
            };
            
            i = i + 1;
        };
    }

    // Verify an artist (platform owner only)
    public entry fun verify_artist(
        platform: &BookingPlatform,
        artist: &mut Artist,
        ctx: &mut TxContext
    ) {
        // Verify caller is the platform owner
        assert!(tx_context::sender(ctx) == platform.owner, EUnauthorizedCaller);
        
        // Mark artist as verified
        artist.is_verified = true;
    }

    // Request a booking
    public entry fun request_booking(
        platform: &mut BookingPlatform,
        artist: &Artist,
        event_name: vector<u8>,
        event_description: vector<u8>,
        event_date: u64,
        venue: vector<u8>,
        deposit: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify artist exists on platform
        assert!(table::contains(&platform.artists, object::id(artist)), EArtistNotFound);
        
        // Verify event date is in the future
        assert!(event_date > tx_context::epoch_timestamp_ms(ctx), EInvalidDate);
        
        // Check if artist is available on the requested date
        if (table::contains(&artist.availability, event_date)) {
            let is_available = *table::borrow(&artist.availability, event_date);
            assert!(is_available, EArtistUnavailable);
        };
        
        // Calculate deposit amount (50% of booking fee)
        let booking_fee = artist.booking_fee;
        let deposit_amount = booking_fee / 2;
        
        // Verify deposit amount
        assert!(coin::value(&deposit) >= deposit_amount, EInsufficientBalance);
        
        // Create booking request
        let booking_id = object::new(ctx);
        let booking = Booking {
            id: booking_id,
            artist_id: object::id(artist),
            requester: tx_context::sender(ctx),
            event_name: string::utf8(event_name),
            event_description: string::utf8(event_description),
            event_date,
            venue: string::utf8(venue),
            fee: booking_fee,
            deposit_amount,
            deposit_paid: true,
            is_confirmed: false,
            is_completed: false,
            is_cancelled: false,
            cancellation_fee_percentage: 5000, // 50% cancellation fee
        };
        
        // Add booking to platform
        table::add(&mut platform.bookings, object::id(&booking), object::id(artist));
        
        // Add deposit to escrow
        coin::join(&mut platform.escrow, deposit);
        
        // Emit booking requested event
        event::emit(BookingRequested {
            booking_id: object::id(&booking),
            artist_id: object::id(artist),
            requester: tx_context::sender(ctx),
            event_date,
            venue: string::utf8(venue),
            fee: booking_fee,
        });
        
        // Share booking object
        transfer::share_object(booking);
    }

    // Confirm a booking (artist only)
    public entry fun confirm_booking(
        platform: &BookingPlatform,
        artist: &mut Artist,
        booking: &mut Booking,
        ctx: &mut TxContext
    ) {
        // Verify caller is the artist
        assert!(tx_context::sender(ctx) == artist.address, EUnauthorizedCaller);
        
        // Verify booking is for this artist
        assert!(booking.artist_id == object::id(artist), EBookingNotFound);
        
        // Verify booking exists on platform
        assert!(table::contains(&platform.bookings, object::id(booking)), EBookingNotFound);
        
        // Verify booking is not already confirmed or cancelled
        assert!(!booking.is_confirmed, EBookingAlreadyConfirmed);
        assert!(!booking.is_cancelled, EBookingAlreadyCancelled);
        
        // Mark booking as confirmed
        booking.is_confirmed = true;
        
        // Update artist availability
        if (table::contains(&artist.availability, booking.event_date)) {
            let availability = table::borrow_mut(&mut artist.availability, booking.event_date);
            *availability = false; // Mark date as unavailable
        } else {
            table::add(&mut artist.availability, booking.event_date, false);
        };
        
        // Increment artist's total bookings
        artist.total_bookings = artist.total_bookings + 1;
        
        // Emit booking confirmed event
        event::emit(BookingConfirmed {
            booking_id: object::id(booking),
            artist_id: object::id(artist),
            requester: booking.requester,
            event_date: booking.event_date,
        });
    }

    // Cancel a booking
    public entry fun cancel_booking(
        platform: &mut BookingPlatform,
        artist: &mut Artist,
        booking: &mut Booking,
        ctx: &mut TxContext
    ) {
        // Verify caller is either the artist or the requester
        let caller = tx_context::sender(ctx);
        let is_artist = caller == artist.address;
        let is_requester = caller == booking.requester;
        assert!(is_artist || is_requester, EUnauthorizedCaller);
        
        // Verify booking is for this artist
        assert!(booking.artist_id == object::id(artist), EBookingNotFound);
        
        // Verify booking exists on platform
        assert!(table::contains(&platform.bookings, object::id(booking)), EBookingNotFound);
        
        // Verify booking is not already cancelled
        assert!(!booking.is_cancelled, EBookingAlreadyCancelled);
        
        // Calculate cancellation fee
        let cancellation_fee = 0;
        if (is_requester && booking.is_confirmed) {
            // If requester cancels after confirmation, apply cancellation fee
            cancellation_fee = (booking.deposit_amount * booking.cancellation_fee_percentage) / 10000;
        };
        
        // Mark booking as cancelled
        booking.is_cancelled = true;
        
        // Process refund (in a real implementation, this would be more complex)
        let refund_amount = booking.deposit_amount - cancellation_fee;
        if (refund_amount > 0 && coin::value(&platform.escrow) >= refund_amount) {
            let refund = coin::split(&mut platform.escrow, refund_amount, ctx);
            transfer::public_transfer(refund, booking.requester);
        };
        
        // If cancellation fee applies, split it between artist and platform
        if (cancellation_fee > 0 && coin::value(&platform.escrow) >= cancellation_fee) {
            let platform_fee = (cancellation_fee * platform.platform_fee_percentage) / 10000;
            let artist_fee = cancellation_fee - platform_fee;
            
            // Transfer artist's share
            let artist_payment = coin::split(&mut platform.escrow, artist_fee, ctx);
            transfer::public_transfer(artist_payment, artist.address);
            
            // Platform fee stays in escrow
        };
        
        // Update artist availability if booking was confirmed
        if (booking.is_confirmed) {
            if (table::contains(&artist.availability, booking.event_date)) {
                let availability = table::borrow_mut(&mut artist.availability, booking.event_date);
                *availability = true; // Mark date as available again
            };
        };
        
        // Emit booking cancelled event
        event::emit(BookingCancelled {
            booking_id: object::id(booking),
            artist_id: object::id(artist),
            requester: booking.requester,
            cancellation_fee,
        });
    }

    // Complete a booking (mark as completed)
    public entry fun complete_booking(
        platform: &mut BookingPlatform,
        artist: &Artist,
        booking: &mut Booking,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the requester
        assert!(tx_context::sender(ctx) == booking.requester, EUnauthorizedCaller);
        
        // Verify booking is for this artist
        assert!(booking.artist_id == object::id(artist), EBookingNotFound);
        
        // Verify booking exists on platform
        assert!(table::contains(&platform.bookings, object::id(booking)), EBookingNotFound);
        
        // Verify booking is confirmed and not cancelled
        assert!(booking.is_confirmed, EBookingNotFound);
        assert!(!booking.is_cancelled, EBookingAlreadyCancelled);
        
        // Calculate remaining payment (full fee minus deposit)
        let remaining_payment = booking.fee - booking.deposit_amount;
        
        // Verify payment amount
        assert!(coin::value(payment) >= remaining_payment, EInsufficientBalance);
        
        // Mark booking as completed
        booking.is_completed = true;
        
        // Process payment
        let platform_fee = (remaining_payment * platform.platform_fee_percentage) / 10000;
        let artist_payment_amount = remaining_payment - platform_fee;
        
        // Split coins for payment
        let artist_payment = coin::split(payment, artist_payment_amount, ctx);
        let platform_fee_payment = coin::split(payment, platform_fee, ctx);
        
        // Transfer payment to artist
        transfer::public_transfer(artist_payment, artist.address);
        
        // Add platform fee to escrow
        coin::join(&mut platform.escrow, platform_fee_payment);
        
        // Process deposit (release from escrow to artist)
        let deposit_to_artist = (booking.deposit_amount * (10000 - platform.platform_fee_percentage)) / 10000;
        if (deposit_to_artist > 0 && coin::value(&platform.escrow) >= deposit_to_artist) {
            let deposit_payment = coin::split(&mut platform.escrow, deposit_to_artist, ctx);
            transfer::public_transfer(deposit_payment, artist.address);
        };
        
        // Emit booking completed event
        event::emit(BookingCompleted {
            booking_id: object::id(booking),
            artist_id: object::id(artist),
            requester: booking.requester,
            event_date: booking.event_date,
        });
    }

    // Rate an artist after booking
    public entry fun rate_artist(
        platform: &BookingPlatform,
        artist: &mut Artist,
        booking: &Booking,
        rating: u64,
        ctx: &mut TxContext
    ) {
        // Verify caller is the requester
        assert!(tx_context::sender(ctx) == booking.requester, EUnauthorizedCaller);
        
        // Verify booking is for this artist
        assert!(booking.artist_id == object::id(artist), EBookingNotFound);
        
        // Verify booking exists on platform
        assert!(table::contains(&platform.bookings, object::id(booking)), EBookingNotFound);
        
        // Verify booking is completed
        assert!(booking.is_completed, EBookingNotFound);
        
        // Verify rating is valid (0-100)
        assert!(rating <= 100, EInvalidRating);
        
        // Update artist rating (simple average for now)
        // In a real implementation, we would store all ratings and calculate a weighted average
        if (artist.total_bookings == 1) {
            artist.rating = rating;
        } else {
            let total_rating = artist.rating * (artist.total_bookings - 1);
            artist.rating = (total_rating + rating) / artist.total_bookings;
        };
    }

    // Update platform fee percentage (only owner)
    public entry fun update_platform_fee(
        platform: &mut BookingPlatform,
        new_fee_percentage: u64,
        ctx: &mut TxContext
    ) {
        // Verify caller is the platform owner
        assert!(tx_context::sender(ctx) == platform.owner, EUnauthorizedCaller);
        
        // Update fee percentage (max 10%)
        assert!(new_fee_percentage <= 1000, EInvalidFeePercentage);
        platform.platform_fee_percentage = new_fee_percentage;
    }

    // Withdraw platform fees (only owner)
    public entry fun withdraw_platform_fees(
        platform: &mut BookingPlatform,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Verify caller is the platform owner
        assert!(tx_context::sender(ctx) == platform.owner, EUnauthorizedCaller);
        
        // Verify sufficient balance
        assert!(coin::value(&platform.escrow) >= amount, EInsufficientBalance);
        
        // Withdraw fees
        let payment = coin::split(&mut platform.escrow, amount, ctx);
        transfer::public_transfer(payment, platform.owner);
    }

    // Get artist information
    public fun get_artist_info(artist: &Artist): (
        address, String, String, String, String, u64, bool, u64, u64
    ) {
        (
            artist.address,
            artist.name,
            artist.description,
            artist.genre,
            artist.image_url,
            artist.booking_fee,
            artist.is_verified,
            artist.rating,
            artist.total_bookings
        )
    }

    // Get booking information
    public fun get_booking_info(booking: &Booking): (
        ID, address, String, String, u64, String, u64, u64, bool, bool, bool
    ) {
        (
            booking.artist_id,
            booking.requester,
            booking.event_name,
            booking.event_description,
            booking.event_date,
            booking.venue,
            booking.fee,
            booking.deposit_amount,
            booking.is_confirmed,
            booking.is_completed,
            booking.is_cancelled
        )
    }

    // Check if artist is available on a specific date
    public fun is_artist_available(artist: &Artist, date: u64): bool {
        if (!table::contains(&artist.availability, date)) {
            return true // Default to available if not specified
        };
        
        *table::borrow(&artist.availability, date)
    }
}
