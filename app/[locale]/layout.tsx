import { notFound } from "next/navigation";
import { prefixedLocales } from "@/lib/i18n/config";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children, params }: Props) {
  const { locale } = params;
  if (!prefixedLocales.includes(locale as any)) {
    notFound();
  }
  return <>{children}</>;
}
