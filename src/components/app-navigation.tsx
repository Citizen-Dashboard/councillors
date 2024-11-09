import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import Link from "next/link";
import { FC } from "react";
import { MenuIcon } from "lucide-react";

export const AppNavigation = () => {
  return (
    <header className="flex items-center py-1 mb-2 px-2 gap-2 sticky top-0 bg-white border-b-2 border-slate-200">
      <div className="block md:hidden">
        <NavigationHamburger />
      </div>
      <Link href="/">
        <h1 className="text-2xl font-semibold">Citizen Dashboard</h1>
      </Link>
      <div className="hidden md:block">
        <NavigationContent orientation="horizontal" />
      </div>
    </header>
  );
};

const NavigationHamburger = () => {
  return (
    <Drawer>
      <DrawerTrigger>
        <MenuIcon aria-label="Navigation menu" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Site navivation menu</DrawerDescription>
        </DrawerHeader>
        <NavigationContent orientation="vertical" />
      </DrawerContent>
    </Drawer>
  );
};

const NavigationContent: FC<{
  orientation: "vertical" | "horizontal";
}> = ({ orientation }) => (
  <NavigationMenu orientation={orientation} className="w-full">
    <NavigationMenuList orientation={orientation}>
      <NavMenuLink text="Councillors" href="/councillors" />
      <NavMenuLink text="Wards" href="/wards" />
      <NavMenuLink text="Committees" href="/committees" />
      <NavMenuLink text="How council works" href="/how-council-works" />
      <NavMenuLink text="About us" href="/about-us" />
    </NavigationMenuList>
  </NavigationMenu>
);

const NavMenuLink: FC<{ text: string; href: string }> = ({ text, href }) => (
  <NavigationMenuItem>
    <Link href={href} legacyBehavior passHref>
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        {text}
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>
);
