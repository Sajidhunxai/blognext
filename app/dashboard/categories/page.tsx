"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featured?: boolean;
  _count?: { posts: number };
}

interface CatTranslation {
  name: string;
  description: string;
}

const LOCALES = [
  { code: "ur", label: "اردو (Urdu)", flag: "🇵🇰", dir: "rtl" as const },
  { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳", dir: "ltr" as const },
];

const emptyTrans = (): CatTranslation => ({ name: "", description: "" });

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form / edit state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "ur" | "hi">("en");

  // English fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // Translation fields: { ur: {...}, hi: {...} }
  const [translations, setTranslations] = useState<Record<string, CatTranslation>>({
    ur: emptyTrans(),
    hi: emptyTrans(),
  });

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [transSaving, setTransSaving] = useState<string | null>(null);
  const [transSuccess, setTransSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}/translations`);
      if (!res.ok) return;
      const data: any[] = await res.json();
      const map: Record<string, CatTranslation> = { ur: emptyTrans(), hi: emptyTrans() };
      data.forEach((t) => {
        if (map[t.locale] !== undefined) {
          map[t.locale] = { name: t.name || "", description: t.description || "" };
        }
      });
      setTranslations(map);
    } catch (e) {
      console.error(e);
    }
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === generateSlug(name)) setSlug(generateSlug(val));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setActiveTab("en");
    setName(""); setSlug(""); setDescription(""); setFeatured(false);
    setTranslations({ ur: emptyTrans(), hi: emptyTrans() });
    setError(""); setSuccess("");
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setFeatured(cat.featured || false);
    setActiveTab("en");
    setShowForm(true);
    setError(""); setSuccess("");
    fetchTranslations(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory
        ? { id: editingCategory.id, name, slug: slug || generateSlug(name), description, featured }
        : { name, slug: slug || generateSlug(name), description, featured };

      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${editingCategory ? "update" : "create"} category`);
      }

      setSuccess(`Category ${editingCategory ? "updated" : "created"} successfully!`);
      fetchCategories();
      if (!editingCategory) resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTranslation = async (locale: string) => {
    if (!editingCategory) return;
    const t = translations[locale];
    if (!t.name) { setError(`Name is required for ${locale} translation`); return; }
    setTransSaving(locale); setError("");
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}/translations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, name: t.name, description: t.description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save translation");
      }
      setTransSuccess(locale);
      setTimeout(() => setTransSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTransSaving(null);
    }
  };

  const updateTrans = (locale: string, field: keyof CatTranslation, value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This cannot be undone.")) return;
    setDeletingId(id); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete category");
      }
      setSuccess("Category deleted successfully!");
      fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const tabCls = (tab: string) =>
    `px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tab
        ? "border-blue-600 text-blue-600 bg-white"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="px-4 py-2 bg-button text-button rounded-lg hover:bg-secondary transition text-sm sm:text-base w-full sm:w-auto"
        >
          {showForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && !showForm && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          {/* Tab bar — only show language tabs when editing an existing category */}
          {editingCategory && (
            <div className="flex gap-1 px-6 pt-4 border-b border-gray-200 bg-gray-50">
              <button className={tabCls("en")} onClick={() => setActiveTab("en")}>🇬🇧 English</button>
              {LOCALES.map((l) => (
                <button key={l.code} className={tabCls(l.code)} onClick={() => setActiveTab(l.code as any)}>
                  {l.flag} {l.label}
                  {translations[l.code]?.name && (
                    <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-green-500" title="Has translation" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 sm:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* ── English / Create tab ── */}
            {(activeTab === "en" || !editingCategory) && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {editingCategory ? "Edit Category (English)" : "Create New Category"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                      Featured Category (show on homepage)
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-button text-button hover:bg-secondary rounded-lg transition disabled:opacity-50"
                    >
                      {submitting
                        ? editingCategory ? "Updating..." : "Creating..."
                        : editingCategory ? "Update Category" : "Create Category"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Translation tabs (ur / hi) ── */}
            {editingCategory && (activeTab === "ur" || activeTab === "hi") && (() => {
              const localeInfo = LOCALES.find((l) => l.code === activeTab)!;
              const t = translations[activeTab];
              return (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    {localeInfo.flag} {localeInfo.label} Translation
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Falls back to English if left empty.</p>

                  {transSuccess === activeTab && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                      Translation saved successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        dir="auto"
                        value={t.name}
                        onChange={(e) => updateTrans(activeTab, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder={`Category name in ${localeInfo.label}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        dir="auto"
                        value={t.description}
                        onChange={(e) => updateTrans(activeTab, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder={`Description in ${localeInfo.label}`}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveTranslation(activeTab)}
                        disabled={transSaving === activeTab}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {transSaving === activeTab ? "Saving…" : "Save Translation"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">No categories yet. Create your first category!</p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
            <table className="w-full" style={{ minWidth: "640px" }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                        {cat.featured && (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">Featured</span>
                        )}
                      </div>
                      {cat.description && <div className="text-sm text-gray-500 mt-1">{cat.description}</div>}
                      <div className="text-xs text-gray-500 sm:hidden mt-1">{cat.slug}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {cat.slug}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {cat._count?.posts || 0}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-blue-600 hover:text-blue-900 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          className="text-red-600 hover:text-red-900 transition disabled:opacity-50 text-sm"
                        >
                          {deletingId === cat.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
