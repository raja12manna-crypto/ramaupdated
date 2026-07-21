/* ============================================================
   RAMA V1 · core/menuNav.js
   Tiny shared helper for menu scenes: vertical selection with
   edge-based up/down, confirm, back. Keeps title/lore/menu/
   settings scenes consistent without duplicating logic.
============================================================ */
export function makeMenuNav(itemCount){
  return {
    sel: 0,
    update(input){
      if(input.tap('up'))   this.sel = (this.sel - 1 + itemCount) % itemCount;
      if(input.tap('down')) this.sel = (this.sel + 1) % itemCount;
    },
  };
}
