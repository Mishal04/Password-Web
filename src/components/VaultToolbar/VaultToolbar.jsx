import "./VaultToolbar.css";
import {
  FiSearch,
  FiPlus,
  FiFilter,
} from "react-icons/fi";

function VaultToolbar({
  onAddPassword,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
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
        />
      </div>

      {/* Actions */}
      <div className="toolbar-actions">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option>All Categories</option>
          <option>Personal</option>
          <option>Social</option>
          <option>Work</option>
          <option>Banking</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>

        <button className="filter-btn">
          <FiFilter />
          Latest
        </button>

        <button
          className="add-btn"
          onClick={onAddPassword}
        >
          <FiPlus />
          Add Password
        </button>
      </div>
    </section>
  );
}

export default VaultToolbar;