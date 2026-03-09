export interface User {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'OWNER' | 'ADMIN';
    createdAt?: string;
}

export interface MenuItem {
    name: string;
    type: 'Veg' | 'Non-Veg';
}

export interface Menu {
    day: string;
    items: MenuItem[];
}

export interface Mess {
    id: string;
    name: string;
    description: string;
    address: string;
    location?: {
        address: string;
        city: string;
    };
    city: string;
    rating: number;
    images: string[];
    imageUrl?: string;
    messImage?: string; // Some pages use messImage
    priceRange?: string;
    monthlyPrice?: number;
    weeklyPrice?: number;
    dailyPrice?: number;
    verified?: boolean;
    cuisine?: string;
    createdAt?: string;
    ownerId?: string;
    ownerName?: string;
    contact?: string;
    mobile?: string;
    menus?: Menu[];
    menuImages?: string[];
    reviews?: Review[];
    owner?: {
        name: string;
        email: string;
    };
    _count?: {
        subscriptions: number;
        reviews: number;
    };
}

export interface Review {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at?: string;
    createdAt?: string; // camelCase alias
    user?: {
        name: string;
        email?: string;
    };
}

export interface Subscription {
    id: string;
    mess_id?: string;
    mess_name?: string;
    plan_type?: string;
    planType?: string;
    status: 'active' | 'pending' | 'expired' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'trial';
    start_date?: string;
    startDate?: string;
    end_date?: string;
    endDate?: string;
    amount?: number;
    mess?: Mess;
    user?: User;
    trial_start?: string;
    trial_end?: string;
    created_at?: string;
    createdAt?: string;
    next_billing_date?: string;
    subscription_end?: string;
    status_id?: string;
}

export interface Chat {
    id: string;
    studentId: string;
    ownerId: string;
    student: User;
    owner: User;
    messages: ChatMessage[];
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    type: string;
}

export interface Activity {
    id: string;
    title: string;
    desc: string;
    time: string;
    created_at?: string;
}
