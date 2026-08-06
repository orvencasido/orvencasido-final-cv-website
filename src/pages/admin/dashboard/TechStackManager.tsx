import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Cpu,
  Save,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Edit2,
  X,
} from 'lucide-react';
import { getSkills, updateSkills } from '../../../lib/services';
import { Skill } from '../../../types';
import { getTechIconUrl } from '../../../lib/techIcons';
import { SectionHeader, LoadingSkeleton } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';

export const TechStackManager: React.FC = () => {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for Adding / Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState<Skill['category']>('DevOps & Cloud');
  const [proficiency, setProficiency] = useState<number>(90);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function loadSkillsData() {
      try {
        const data = await getSkills();
        setSkills(data);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSkillsData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setIcon('');
    setCategory('DevOps & Cloud');
    setProficiency(90);
    setIsVisible(true);
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setName(skill.name);
    setIcon(skill.icon || '');
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setIsVisible(skill.is_visible);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Skill name is required', 'error');
      return;
    }

    let updatedList: Skill[] = [];

    if (editingId) {
      updatedList = skills.map((s) =>
        s.id === editingId
          ? {
              ...s,
              name,
              icon: icon.trim() || undefined,
              category,
              proficiency,
              is_visible: isVisible,
              updated_at: new Date().toISOString(),
            }
          : s
      );
    } else {
      const newSkill: Skill = {
        id: `sk_${Date.now()}`,
        name,
        icon: icon.trim() || undefined,
        category,
        proficiency,
        sort_order: skills.length + 1,
        is_visible: isVisible,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updatedList = [...skills, newSkill];
    }

    setSaving(true);
    try {
      const saved = await updateSkills(updatedList);
      setSkills(saved);
      showToast(editingId ? 'Tech item updated!' : 'Tech item added successfully!', 'success');
      resetForm();
    } catch (err) {
      console.error('Failed to save skill:', err);
      showToast('Error saving tech item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this tech item?')) return;
    const updatedList = skills.filter((s) => s.id !== id);
    setSaving(true);
    try {
      const saved = await updateSkills(updatedList);
      setSkills(saved);
      showToast('Tech item removed.', 'success');
    } catch (err) {
      console.error('Failed to delete skill:', err);
      showToast('Failed to delete item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id: string) => {
    const updatedList = skills.map((s) =>
      s.id === id ? { ...s, is_visible: !s.is_visible, updated_at: new Date().toISOString() } : s
    );
    const saved = await updateSkills(updatedList);
    setSkills(saved);
  };

  const moveSkill = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === skills.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSkills = [...skills];
    const [moved] = newSkills.splice(index, 1);
    newSkills.splice(targetIndex, 0, moved);

    const reordered = newSkills.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setSkills(reordered);
    await updateSkills(reordered);
  };

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-8 max-w-5xl">
      <SectionHeader
        title="Tech Stack & Skill Icons"
        description="Add, update, or re-order tech icons displayed on the public Home page. Supports SimpleIcons slugs (e.g., kubernetes, docker, python) or custom image URLs."
      />

      {/* Add / Edit Form Box */}
      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-beige-200 pb-4">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-matcha-600" />
            {editingId ? 'Edit Tech Icon' : 'Add New Tech Icon'}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-matcha-700 hover:text-matcha-950 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSkill} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tech Name */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Tech Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Kubernetes, Docker, React"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
                required
              />
            </div>

            {/* Icon Slug or Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Icon Slug or URL
              </label>
              <input
                type="text"
                placeholder="e.g. docker OR https://..."
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
              <p className="text-[11px] text-matcha-700 font-medium">
                Leave empty for auto-matching, or type a SimpleIcons slug (e.g. kubernetes, python).
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Skill['category'])}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              >
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Backend & APIs">Backend & APIs</option>
                <option value="Frontend">Frontend</option>
                <option value="Databases & IaC">Databases & IaC</option>
                <option value="Tools & Methods">Tools & Methods</option>
              </select>
            </div>
          </div>

          {/* Live Icon Preview & Options */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-beige-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-matcha-700">Live Preview:</span>
              <div className="flex items-center gap-3 p-3 bg-beige-100 rounded-2xl border border-beige-300">
                {name ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={getTechIconUrl({ name, icon })}
                      alt={name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-extrabold font-mono text-matcha-950">
                      {name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-matcha-600 italic font-medium">Type name above to preview</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-matcha-900">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
                />
                Show on Home Page
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-matcha-900 text-beige-50 text-xs font-extrabold rounded-full hover:bg-matcha-800 transition flex items-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : editingId ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingId ? 'Update Item' : 'Add Tech Icon'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tech Stack List Grid */}
      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-beige-200 pb-4">
          <h3 className="text-lg font-extrabold text-matcha-950">
            Active Tech Stack Items ({skills.length})
          </h3>
          <p className="text-xs text-matcha-700 font-medium">
            40% opacity &rarr; 100% hover opacity + tooltip.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills.map((skill, index) => {
            const iconUrl = getTechIconUrl(skill);
            return (
              <div
                key={skill.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all group/item ${
                  skill.is_visible
                    ? 'border-beige-300 bg-beige-100'
                    : 'border-beige-300 opacity-40 bg-beige-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-matcha-600 font-bold">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSkill(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-matcha-600 hover:text-matcha-950 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSkill(index, 'down')}
                      disabled={index === skills.length - 1}
                      className="p-1 text-matcha-600 hover:text-matcha-950 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Icon Preview */}
                <div className="relative group/tech flex items-center justify-center h-12 my-2 cursor-pointer">
                  <img
                    src={iconUrl}
                    alt={skill.name}
                    className="w-8 h-8 object-contain opacity-40 group-hover/tech:opacity-100 group-hover/tech:scale-110 transition-all duration-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover/tech:flex flex-col items-center pointer-events-none z-30">
                    <span className="px-2.5 py-1 bg-matcha-950 text-beige-50 text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap">
                      {skill.name}
                    </span>
                  </div>
                </div>

                <div className="text-center mt-1">
                  <p className="text-xs font-extrabold text-matcha-950 truncate">
                    {skill.name}
                  </p>
                  <p className="text-[10px] font-semibold text-matcha-700 truncate">{skill.category}</p>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2 border-t border-beige-200 flex items-center justify-between">
                  <button
                    onClick={() => toggleVisibility(skill.id)}
                    className="p-1 text-matcha-700 hover:text-matcha-950 cursor-pointer"
                    title={skill.is_visible ? 'Hide from home' : 'Show on home'}
                  >
                    {skill.is_visible ? (
                      <Eye className="w-3.5 h-3.5 text-matcha-800" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(skill)}
                      className="p-1 text-matcha-700 hover:text-matcha-950 cursor-pointer"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1 text-matcha-700 hover:text-red-700 cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
