import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const renderCategoryTree = (categories, level = 0, onClickSuccess) => {
  let result = [];
  categories.forEach((category, index) => { 
    result.push(
      <DropdownMenuItem key={`${category.id}-${index}`} value={category.id} onClick={() => onClickSuccess(category.id)}>
        {'--'.repeat(level) + ' ' + category.name}
      </DropdownMenuItem>
    );
    if (category.children && category.children.length > 0) {
      result = result.concat(renderCategoryTree(category.children, level + 1, onClickSuccess));
    }
  });
  return result;
}

export const buildCategoryTree = (categories) => {
  const map = {};
  const tree = [];

  categories.forEach(cat => {
    map[cat.id] = {
      id: cat.id,
      name: cat.name,
      children: [],
    };
  });

  categories.forEach(cat => {
    if (cat.id_parent) {
      map[cat.id_parent]?.children.push(map[cat.id]);
    } else {
      tree.push(map[cat.id]);
    }
  });

  return tree;
};