import Link from "next/link";
import dynamic from "next/dynamic";

const ColoredLink = dynamic(() => import("@/components/ColoredLink"), {
  ssr: false,
});

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  textColor?: string;
}

export default function Breadcrumbs({ items, textColor = "#6b7280" }: BreadcrumbsProps) {
  return (
    <nav className="text-sm mb-4 sm:mb-6 " aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1 sm:gap-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index === items.length - 1 ? (
              <span className={`font-medium text-theme-text dark:text-white`}  >
                {item.label}
              </span>
            ) : (
              <>
                <ColoredLink
                  href={item.href}
                  defaultColor={textColor}
                  hoverColor="#111827"
                  className="hover:underline "
                >
                  {item.label}
                </ColoredLink>
                <span className={`mx-2 text-theme-text dark:text-white`} aria-hidden="true">
                  /
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

