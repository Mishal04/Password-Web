import "./VaultToolbar.css";
import { FiSearch, FiPlus, FiArrowDown } from "react-icons/fi";

const CATEGORIES = [
  "All Categories",
  "Social",
  "Email",
  "Work",
  "Shopping",
  "Banking",
  "Entertainment",
  "Development",
  "Other",
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "az",     label: "A → Z"  },
];

function VaultToolbar({
  onAddPassword,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortOrder,
  onSortChange,
}) {
  return (
    <section className="vault-toolbar">
      {/* Search */}
      <div className="toolbar-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search passwords"
        />
      </div>

      {/* Filters + Add */}
      <div className="toolbar-actions">
        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="toolbar-sort">
          <FiArrowDown className="toolbar-sort__icon" />
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort passwords"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add button */}
        <button className="add-btn" onClick={onAddPassword}>
          <FiPlus />
          Add Password
        </button>
      </div>
    </section>
  );
}

export default VaultToolbar;
