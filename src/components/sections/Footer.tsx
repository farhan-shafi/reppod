import { Dumbbell } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help center", "Blog", "Trainer playbook", "API docs"],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
              <Dumbbell className="size-4 text-white" />
            </span>
            <span className="font-bold text-lg text-white">FlexFlow</span>
          </div>
          <p className="text-sm text-white/50 max-w-sm">
            The coaching platform built for the next generation of personal
            trainers.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-white mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/40">
        <span>© {new Date().getFullYear()} FlexFlow. All rights reserved.</span>
        <span>Made for trainers who actually train.</span>
      </div>
    </footer>
  );
}
