"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import {
  FOODS,
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
  macrosForQty,
  type FoodCategory,
} from "@/lib/foods";
import type { MealItemInput } from "@/lib/schemas/nutrition";
import { cn } from "@/lib/utils";

type Filter = "all" | FoodCategory;

export default function FoodPickerModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: MealItemInput) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [grams, setGrams] = useState(100);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Custom food fields
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCals, setCustomCals] = useState(0);
  const [customP, setCustomP] = useState(0);
  const [customC, setCustomC] = useState(0);
  const [customF, setCustomF] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (filter !== "all" && f.category !== filter) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  function reset() {
    setSelectedId(null);
    setGrams(100);
    setCustomMode(false);
    setCustomName("");
    setCustomCals(0);
    setCustomP(0);
    setCustomC(0);
    setCustomF(0);
  }

  function addStandard(foodId: string) {
    const food = FOODS.find((f) => f.id === foodId);
    if (!food) return;
    const m = macrosForQty(food.per100, grams);
    onAdd({ foodId: food.id, name: food.name, qtyGrams: grams, ...m });
    reset();
  }

  function addCustom(e: FormEvent) {
    e.preventDefault();
    if (customName.trim().length === 0) return;
    onAdd({
      name: customName.trim(),
      qtyGrams: grams,
      calories: customCals,
      protein: customP,
      carbs: customC,
      fat: customF,
    });
    reset();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add food</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 border-b border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wider text-white/50">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
                />
                <span className="text-sm text-white/40">grams</span>
                <button
                  onClick={() => setCustomMode((v) => !v)}
                  className="ml-auto text-xs text-fuchsia-300 hover:text-fuchsia-200 transition"
                >
                  {customMode ? "← Pick from list" : "+ Custom food"}
                </button>
              </div>

              {!customMode && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                      placeholder="Search foods…"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-fuchsia-500/50 transition"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Chip active={filter === "all"} onClick={() => setFilter("all")}>
                      All
                    </Chip>
                    {FOOD_CATEGORIES.map((c) => (
                      <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
                        {FOOD_CATEGORY_LABELS[c]}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </div>

            {customMode ? (
              <form onSubmit={addCustom} className="p-5 space-y-3 overflow-y-auto">
                <Field label="Food name" value={customName} onChange={setCustomName} />
                <div className="grid grid-cols-4 gap-2">
                  <NumField label="Cals" value={customCals} onChange={setCustomCals} />
                  <NumField label="Protein" value={customP} onChange={setCustomP} />
                  <NumField label="Carbs" value={customC} onChange={setCustomC} />
                  <NumField label="Fat" value={customF} onChange={setCustomF} />
                </div>
                <p className="text-xs text-white/40">
                  Enter macros for the {grams}g serving above.
                </p>
                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                >
                  Add custom food
                </button>
              </form>
            ) : (
              <ul className="flex-1 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <li className="p-8 text-center text-sm text-white/40">
                    No foods match your search.
                  </li>
                ) : (
                  filtered.map((food) => {
                    const m = macrosForQty(food.per100, grams);
                    return (
                      <li key={food.id}>
                        <button
                          onClick={() => addStandard(food.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left"
                        >
                          <div className="size-9 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-orange-500/20 flex items-center justify-center">
                            <Plus className="size-4 text-white/80" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {food.name}
                            </p>
                            <p className="text-xs text-white/40">
                              {grams}g · {m.calories} kcal · {m.protein}P / {m.carbs}C / {m.fat}F
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs border transition",
        active
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-0.5 w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
      />
    </label>
  );
}
