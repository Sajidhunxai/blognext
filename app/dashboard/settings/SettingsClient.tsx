"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { useTheme } from "@/contexts/ThemeContext";
import ColoredButton from "@/components/ColoredButton";

type FooterLink = string | { label: string; url: string };
type HeaderMenuItem = string | { label: string; url: string };

interface SettingsState {
  siteName: string;
  logo: string;
  darkModeLogo: string;
  favicon: string;
  headerMenu: HeaderMenuItem[];
  footerLinks: FooterLink[];
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    pinterest: string;
    telegram: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  heroBackground: string;
  metaTitle: string;
  metaDescription: string;
  whyChooseTitle: string;
  whyChooseSubtitle: string;
  whyChooseFeatures: Array<{ icon: string; title: string; description: string; color?: string }>;
  enableComments: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  linkColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  darkModeBackgroundColor: string;
  darkModeTextColor: string;
  enableWatermark: boolean;
  watermarkImage: string;
  watermarkPosition: string;
  watermarkOpacity: number;
  watermarkScale: number;
  headerScript: string;
  footerScript: string;
  headerCSS: string;
  footerCSS: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

interface SettingsClientProps {
  initialSettings: SettingsState;
  pages: Page[];
}

export default function SettingsClient({ initialSettings, pages: initialPages }: SettingsClientProps) {
  const router = useRouter();
  const { colors, updateColors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [mounted, setMounted] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      // Clear localStorage cache so fresh settings are fetched
      if (typeof window !== "undefined") {
        localStorage.removeItem("app_settings");
        localStorage.removeItem("app_settings_version");
      }

      setSuccess("Settings saved successfully!");
      // Update theme context with new colors
      updateColors({
        primary: settings.primaryColor,
        secondary: settings.secondaryColor,
        background: settings.backgroundColor,
        text: settings.textColor,
        button: settings.buttonColor,
        buttonText: settings.buttonTextColor,
        link: settings.linkColor,
        success: settings.successColor,
        error: settings.errorColor,
        warning: settings.warningColor,
        info: settings.infoColor,
      });

      // Reload page to reflect changes
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initialize defaults");
      }

      const data = await response.json();

      // Clear localStorage cache
      if (typeof window !== "undefined") {
        localStorage.removeItem("app_settings");
        localStorage.removeItem("app_settings_version");
      }

      // Reload page to get fresh settings from server
      setSuccess(data.message || "Settings initialized to defaults successfully!");
      
      // Reload page to reflect changes
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to initialize defaults");
    } finally {
      setSaving(false);
    }
  };

  const addHeaderMenuItem = () => {
    setSettings({
      ...settings,
      headerMenu: [...settings.headerMenu, { label: "", url: "" }],
    });
  };

  const updateHeaderMenuItem = (index: number, field: "label" | "url", value: string) => {
    const newMenu: HeaderMenuItem[] = [...settings.headerMenu];
    let menuItem: { label: string; url: string };
    
    // Convert old string format to object format if needed
    if (typeof newMenu[index] === "string") {
      const oldValue = newMenu[index] as string;
      // If it's a page reference, extract info
      if (oldValue.startsWith("page:")) {
        const slug = oldValue.substring(5);
        const page = pages.find(p => p.slug === slug);
        menuItem = { 
          label: page ? page.title : slug, 
          url: `/pages/${slug}` 
        };
      } else {
        // For old string items, use it as label and generate URL
        menuItem = { 
          label: oldValue, 
          url: index === 0 && oldValue.toLowerCase() === "home" ? "/" : `/${oldValue.toLowerCase().replace(/\s+/g, "-")}` 
        };
      }
    } else {
      menuItem = { ...(newMenu[index] as { label: string; url: string }) };
    }
    
    menuItem[field] = value;
    newMenu[index] = menuItem;
    setSettings({ ...settings, headerMenu: newMenu });
  };

  const getMenuDisplayValue = (item: HeaderMenuItem, field: "label" | "url"): string => {
    if (typeof item === "string") {
      // Handle old string format
      if (item.startsWith("page:")) {
        const slug = item.substring(5);
        const page = pages.find(p => p.slug === slug);
        if (field === "label") {
          return page ? page.title : slug;
        } else {
          return `/pages/${slug}`;
        }
      } else {
        if (field === "label") {
          return item;
        } else {
          return item.toLowerCase() === "home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`;
        }
      }
    } else {
      return item[field];
    }
  };

  const removeHeaderMenuItem = (index: number) => {
    const newMenu = settings.headerMenu.filter((_, i) => i !== index);
    setSettings({ ...settings, headerMenu: newMenu });
  };

  const addFooterLink = () => {
    setSettings({
      ...settings,
      footerLinks: [...settings.footerLinks, { label: "", url: "" }] as FooterLink[],
    });
  };

  const updateFooterLink = (index: number, field: string, value: string) => {
    const newLinks: FooterLink[] = [...settings.footerLinks];
    let linkObj: { label: string; url: string };
    
    if (typeof newLinks[index] === "string") {
      linkObj = { label: newLinks[index] as string, url: "" };
    } else {
      linkObj = { ...(newLinks[index] as { label: string; url: string }) };
    }
    
    linkObj[field as keyof typeof linkObj] = value;
    newLinks[index] = linkObj;
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const removeFooterLink = (index: number) => {
    const newLinks = settings.footerLinks.filter((_, i) => i !== index);
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const handleWatermarkBackfill = async () => {
    if (!confirm("This will add watermarks to all existing images. This may take a few minutes. Continue?")) {
      return;
    }

    setBackfilling(true);
    setBackfillMessage("");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/watermark/backfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process watermark backfill");
      }

      setSuccess(
        `Watermark backfill completed! Processed ${data.processed || 0} images.` +
        (data.errors > 0 ? ` ${data.errors} errors occurred.` : "")
      );
      setBackfillMessage(
        `Processed: ${data.processed || 0} images` +
        (data.errors > 0 ? `, Errors: ${data.errors}` : "")
      );
    } catch (err: any) {
      setError(err.message || "Failed to process watermark backfill");
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ '--theme-primary': colors.primary, '--theme-button': colors.button } as React.CSSProperties}>
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/dashboard" className="text-xl sm:text-2xl font-bold text-gray-900">
              Blog CMS
            </Link>
          </div>
        </div>
      </nav>
      
      {!mounted && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500 text-lg">Loading settings...</div>
        </div>
      )}

      {mounted && (

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Settings</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Settings */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm sm:text-base"
                      style={{ color: '#000' }}
                      required
                    />
                </div>

                <div>
                  <ImageUpload
                    id="logo"
                    value={settings.logo}
                    onChange={(url) => setSettings({ ...settings, logo: url })}
                    label="Logo (Light Mode)"
                    placeholder="Upload or enter logo URL"
                  />
                </div>

                <div>
                  <ImageUpload
                    id="darkModeLogo"
                    value={settings.darkModeLogo}
                    onChange={(url) => setSettings({ ...settings, darkModeLogo: url })}
                    label="Logo (Dark Mode)"
                    placeholder="Upload or enter dark mode logo URL (optional)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Upload a separate logo for dark mode. If not provided, the light mode logo will be used.
                  </p>
                </div>

                <div>
                  <ImageUpload
                    id="favicon"
                    value={settings.favicon}
                    onChange={(url) => setSettings({ ...settings, favicon: url })}
                    label="Favicon"
                    placeholder="Upload or enter favicon URL"
                  />
                </div>
              </div>
            </div>

            {/* Header Menu */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Header Menu</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <ColoredButton
                    type="button"
                    onClick={addHeaderMenuItem}
                    color="button"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    + Add Custom
                  </ColoredButton>
                  {pages.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedPage = pages.find(p => p.id === e.target.value);
                          if (selectedPage) {
                            setSettings({
                              ...settings,
                              headerMenu: [...settings.headerMenu, { 
                                label: selectedPage.title, 
                                url: `/pages/${selectedPage.slug}` 
                              }],
                            });
                            e.target.value = "";
                          }
                        }
                      }}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base w-full sm:w-auto"
                      style={{ color: '#000' }}
                      defaultValue=""
                    >
                      <option value="">Add Page...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {settings.headerMenu.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={getMenuDisplayValue(item, "label")}
                      onChange={(e) => updateHeaderMenuItem(index, "label", e.target.value)}
                      placeholder="Menu item name"
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                      style={{ color: '#000' }}
                    />
                    <input
                      type="text"
                      value={getMenuDisplayValue(item, "url")}
                      onChange={(e) => updateHeaderMenuItem(index, "url", e.target.value)}
                      placeholder="URL (e.g., / or /pages/about)"
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                      style={{ color: '#000' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeHeaderMenuItem(index)}
                      className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tip: Use page dropdown to add pages, or add custom menu items manually. First item should link to home (/).
              </p>
            </div>

            {/* Footer Links */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Footer Links</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <ColoredButton
                    type="button"
                    onClick={addFooterLink}
                    color="button"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    + Add Custom
                  </ColoredButton>
                  {pages.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedPage = pages.find(p => p.id === e.target.value);
                          if (selectedPage) {
                            setSettings({
                              ...settings,
                              footerLinks: [
                                ...settings.footerLinks,
                                { label: selectedPage.title, url: `/pages/${selectedPage.slug}` },
                              ] as FooterLink[],
                            });
                            e.target.value = "";
                          }
                        }
                      }}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base w-full sm:w-auto"
                      style={{ color: '#000' }}
                      defaultValue=""
                    >
                      <option value="">Add Page...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {settings.footerLinks.map((link, index) => {
                  const linkObj = typeof link === "string" ? { label: link, url: "" } : link;
                  return (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={linkObj.label}
                        onChange={(e) => updateFooterLink(index, "label", e.target.value)}
                        placeholder="Link label"
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                        style={{ color: '#000' }}
                      />
                      <input
                        type="url"
                        value={linkObj.url}
                        onChange={(e) => updateFooterLink(index, "url", e.target.value)}
                        placeholder="URL (e.g., /pages/about or https://example.com)"
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                        style={{ color: '#000' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFooterLink(index)}
                        className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tip: Use page dropdown to add pages, or add custom links manually. Use relative paths like /pages/about for internal pages.
              </p>
            </div>

            {/* Social Media */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(settings.socialMedia).map((platform) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {platform}
                    </label>
                    <input
                      type="url"
                      value={(settings.socialMedia as any)[platform] || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            [platform]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                      style={{ color: '#000' }}
                      placeholder={`${platform} URL`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hero Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                    style={{ color: '#000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                    style={{ color: '#000' }}
                  />
                </div>

                <div>
                  <ImageUpload
                    id="heroBackground"
                    value={settings.heroBackground}
                    onChange={(url) => setSettings({ ...settings, heroBackground: url })}
                    label="Hero Background Image"
                    placeholder="Upload or enter background image URL"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings (Homepage)</h2>
              <p className="text-sm text-gray-600 mb-4">
                These fields are used for search engine optimization. They are separate from the hero title and subtitle shown on the page.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title (for SEO)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm sm:text-base"
                    style={{ color: '#000' }}
                    placeholder="e.g., Download Best Games & Apps - Site Name"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description (for SEO)
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm sm:text-base"
                    style={{ color: '#000' }}
                    placeholder="e.g., Download the best games and apps for Android. Free APK downloads, latest versions, and reviews."
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Us Section</h2>
              <p className="text-sm text-gray-600 mb-4">
                Customize the "Why Choose Us" section that appears before the footer on the homepage.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={settings.whyChooseTitle}
                    onChange={(e) => setSettings({ ...settings, whyChooseTitle: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm sm:text-base"
                    style={{ color: '#000' }}
                    placeholder="e.g., Why Choose App Marka?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.whyChooseSubtitle}
                    onChange={(e) => setSettings({ ...settings, whyChooseSubtitle: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm sm:text-base"
                    style={{ color: '#000' }}
                    placeholder="e.g., Your trusted source for the latest apps and games"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (JSON Format)
                  </label>
                  <textarea
                    value={JSON.stringify(settings.whyChooseFeatures || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setSettings({ ...settings, whyChooseFeatures: Array.isArray(parsed) ? parsed : [] });
                      } catch (err) {
                        // Invalid JSON, keep as is
                      }
                    }}
                    rows={12}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                    style={{ color: '#000', backgroundColor: '#f9fafb' }}
                    placeholder='[{"icon": "phone", "title": "Latest Apps", "description": "Get access to the newest apps", "color": "primary"}, ...]'
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter features as JSON array. Each feature should have: icon (phone/check/bolt/dollar), title, description, and optional color (primary/secondary/info/warning).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultFeatures = [
                        { icon: "phone", title: "Latest Apps", description: "Get access to the newest and most popular apps updated daily", color: "primary" },
                        { icon: "check", title: "Safe Downloads", description: "All apps are verified and safe to download with no malware", color: "secondary" },
                        { icon: "bolt", title: "Fast Downloads", description: "High-speed download servers for quick and easy access", color: "info" },
                        { icon: "dollar", title: "Free Forever", description: "100% free downloads with no hidden costs or subscriptions", color: "warning" }
                      ];
                      setSettings({ ...settings, whyChooseFeatures: defaultFeatures });
                    }}
                    className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Load Default Features
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments Settings</h2>
              <div className="flex items-center">
                <input
                  id="enableComments"
                  type="checkbox"
                  checked={settings.enableComments}
                  onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableComments" className="ml-2 block text-sm text-gray-700">
                  Enable Comments Globally
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                When enabled, comments can be posted on posts. Individual posts can also have comments disabled.
              </p>
            </div>

            {/* Theme Colors */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme Colors</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'primaryColor', label: 'Primary Color', placeholder: '#dc2626' },
                  { key: 'secondaryColor', label: 'Secondary Color', placeholder: '#16a34a' },
                  { key: 'backgroundColor', label: 'Background Color', placeholder: '#111827' },
                  { key: 'textColor', label: 'Text Color', placeholder: '#ffffff' },
                  { key: 'buttonColor', label: 'Button Color', placeholder: '#dc2626' },
                  { key: 'buttonTextColor', label: 'Button Text Color', placeholder: '#ffffff' },
                  { key: 'linkColor', label: 'Link Color', placeholder: '#3b82f6' },
                  { key: 'successColor', label: 'Success Color', placeholder: '#16a34a' },
                  { key: 'errorColor', label: 'Error Color', placeholder: '#dc2626' },
                  { key: 'warningColor', label: 'Warning Color', placeholder: '#f59e0b' },
                  { key: 'infoColor', label: 'Info Color', placeholder: '#3b82f6' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type="color"
                      value={settings[key as keyof SettingsState] as string}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings[key as keyof SettingsState] as string}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                      style={{ color: '#000' }}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Watermark Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Watermark</h2>
              <p className="text-sm text-gray-600 mb-4">Automatically add a watermark to all uploaded post images</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableWatermark"
                    checked={settings.enableWatermark}
                    onChange={(e) => setSettings({ ...settings, enableWatermark: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableWatermark" className="text-sm font-medium text-gray-700">
                    Enable Watermark on Uploaded Images
                  </label>
                </div>

                {settings.enableWatermark && (
                  <>
                    <div>
                      <ImageUpload
                        id="watermarkImage"
                        value={settings.watermarkImage}
                        onChange={(url) => setSettings({ ...settings, watermarkImage: url })}
                        label="Watermark Image"
                        placeholder="Upload your logo or watermark image"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload a PNG image with transparency for best results. Recommended size: 200x200px
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Watermark Position
                      </label>
                      <select
                        value={settings.watermarkPosition}
                        onChange={(e) => setSettings({ ...settings, watermarkPosition: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                      >
                        <option value="bottom_right">Bottom Right</option>
                        <option value="bottom_left">Bottom Left</option>
                        <option value="top_right">Top Right</option>
                        <option value="top_left">Top Left</option>
                        <option value="center">Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Watermark Opacity: {settings.watermarkOpacity}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={settings.watermarkOpacity}
                        onChange={(e) => setSettings({ ...settings, watermarkOpacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Adjust the transparency of the watermark (10% = very transparent, 100% = fully opaque)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Watermark Scale: {settings.watermarkScale}% of image width
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={settings.watermarkScale}
                        onChange={(e) => setSettings({ ...settings, watermarkScale: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Control the size of the watermark relative to the image (5% = very small, 50% = half the image width)
                      </p>
                    </div>

                    {/* Backfill Watermarks - Inside watermark settings */}
                    <div className="border-t-2 border-blue-200 bg-blue-50 rounded-lg p-4 mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span>🔄</span>
                        <span>Backfill Watermarks</span>
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Add watermarks to all existing images (posts and pages). This will process all images that were uploaded before watermarking was enabled. The watermark will be applied via URL transformation - no re-uploading required.
                      </p>
                      {(!settings.enableWatermark || !settings.watermarkImage) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-amber-800 font-medium">
                            ⚠️ Please enable watermark and upload a watermark image first before running the backfill.
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleWatermarkBackfill}
                        disabled={backfilling || !settings.enableWatermark || !settings.watermarkImage}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-md hover:shadow-lg"
                      >
                        {backfilling ? "⏳ Processing..." : "✨ Add Watermarks to Old Images"}
                      </button>
                      {backfillMessage && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">{backfillMessage}</p>
                        </div>
                      )}
                    </div>

                  </>
                )}
              </div>
            </div>

            {/* Dark Mode Colors */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dark Mode Colors</h2>
              <p className="text-sm text-gray-600 mb-4">Configure the background and text colors for dark mode theme</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'darkModeBackgroundColor', label: 'Dark Mode Background Color', placeholder: '#0a0a0a' },
                  { key: 'darkModeTextColor', label: 'Dark Mode Text Color', placeholder: '#ededed' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type="color"
                      value={settings[key as keyof SettingsState] as string}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings[key as keyof SettingsState] as string}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                      style={{ color: '#000' }}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Scripts and CSS Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Custom Scripts & CSS</h2>
              
              <div className="space-y-6">
                {[
                  { key: 'headerScript', label: 'Header Scripts (added in <head>)', placeholder: '<!-- Add scripts here -->', desc: 'Scripts will be added in the <head> section' },
                  { key: 'footerScript', label: 'Footer Scripts (added before </body>)', placeholder: '<!-- Add scripts here -->', desc: 'Scripts will be added before the closing </body> tag' },
                  { key: 'headerCSS', label: 'Header CSS (added in <head>)', placeholder: '/* Add custom CSS here */', desc: 'CSS will be added in a <style> tag in the <head> section' },
                  { key: 'footerCSS', label: 'Footer CSS (added before </body>)', placeholder: '/* Add custom CSS here */', desc: 'CSS will be added in a <style> tag before the closing </body> tag' },
                ].map(({ key, label, placeholder, desc }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <textarea
                      value={settings[key as keyof SettingsState] as string}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                      style={{ color: '#000', backgroundColor: '#f9fafb' }}
                      placeholder={placeholder}
                    />
                    <p className="mt-1 text-xs text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <ColoredButton
                type="submit"
                disabled={saving}
                color="button"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {saving ? "Saving..." : "Save Settings"}
              </ColoredButton>
              <button
                type="button"
                onClick={handleInitializeDefaults}
                disabled={saving}
                className="bg-yellow-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-yellow-600 transition text-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Processing..." : "Reset to Defaults"}
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition text-center text-sm sm:text-base"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
      )}
    </div>
  );
}

