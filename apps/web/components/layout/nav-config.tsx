import {
  Home,
  Map as MapIcon,
  Siren,
  User as UserIcon,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Matches `pathname.startsWith(prefix)` to detect active state. */
  matchPrefix: string;
}

/**
 * Primary sections per spec layout rules.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home, matchPrefix: "/" },
  { label: "Map", href: "/map", icon: MapIcon, matchPrefix: "/map" },
  { label: "Emergency", href: "/emergency", icon: Siren, matchPrefix: "/emergency" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, matchPrefix: "/leaderboard" },
  { label: "Profile", href: "/profile", icon: UserIcon, matchPrefix: "/profile" },
];

