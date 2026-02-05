export interface NavigationItem {
    label: string;
    href: string;
    active?: boolean;
}

/**
 * Header component props
 */
export interface HeaderProps {
    navigation: NavigationItem[];
    cartCount: number;
    userName?: string;
    onSearchClick?: () => void;
    onCartClick?: () => void;
    onUserClick?: () => void;
}

/**
 * Header icon types
 */
export type HeaderIconType = 'search' | 'cart' | 'user';

/**
 * Header icon component props
 */
export interface HeaderIconProps {
    type: HeaderIconType;
    badgeCount?: number;
    onClick?: () => void;
}

/**
 * Header main component (logo) props
 */
export interface HeaderMainProps {
    logo: string;
    href: string;
}

/**
 * Header navigation component props
 */
export interface HeaderNavigationProps {
    items: NavigationItem[];
    activePath?: string;
}

/**
 * Footer link item structure
 */
export interface FooterLinkItem {
    label: string;
    href: string;
}

/**
 * Footer column structure
 */
export interface FooterColumn {
    title: string;
    links: FooterLinkItem[];
}

/**
 * Social media link structure
 */
export interface SocialLink {
    platform: string;
    href: string;
    icon?: React.ReactNode;
}

/**
 * Contact information structure
 */
export interface ContactInfo {
    email: string;
    socialLinks: SocialLink[];
}

/**
 * Company information for footer
 */
export interface CompanyInfo {
    logo: string;
    status: string;
    description: string;
}

/**
 * Main footer component props
 */
export interface FooterProps {
    companyInfo: CompanyInfo;
    services: FooterColumn;
    connect: FooterColumn;
    contact: ContactInfo;
}

/**
 * Footer logo section props
 */
export interface FooterLogoProps {
    logo: string;
    status: string;
    description: string;
}

/**
 * Footer links section props
 */
export interface FooterLinksProps {
    title: string;
    links: FooterLinkItem[];
}

/**
 * Footer contact section props
 */
export interface FooterContactProps {
    title: string;
    email: string;
    socialLinks: SocialLink[];
}

/**
 * Mobile menu props
 */
export interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navigation: NavigationItem[];
    userName?: string;
    onLogout?: () => void;
}

/**
 * Search modal props
 */
export interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch?: (query: string) => void;
}

/**
 * Sticky header state
 */
export interface StickyHeaderState {
    isSticky: boolean;
    scrollY: number;
}

/**
 * Header scroll effect options
 */
export interface HeaderScrollEffect {
    threshold: number;
    className?: string;
}

/**
 * Footer section type
 */
export type FooterSection = 'company' | 'services' | 'connect' | 'contact';
