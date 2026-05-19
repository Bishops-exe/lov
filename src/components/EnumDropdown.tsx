import {useMemo} from "react";

export default function EnumDropdown<T extends Record<string, string | number>>({
                                                                                  target,
                                                                                  active,
                                                                                  setActive
                                                                                }: {
  target: T,
  active: number,
  setActive: (value: number) => void
}) {


  const entries = useMemo(() =>
          Object.entries(target)
          .filter(([k]) => isNaN(Number(k)))
          .sort(([, a], [, b]) => (a as number) - (b as number))
      , [target]);

  const activeLabel = entries.find(([, v]) => v === active)?.[0] ?? String(active);

  return (
      <div className="dropdown">
        <div role="button" tabIndex={0} className="btn m-1">{activeLabel}</div>
        <ul tabIndex={0}
            className="dropdown-content border-2 border-(--color-base-300) menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-xl">
          {entries.filter(([, value]) => value !== active).map(([key, value]) => (
              <li key={key}>
                <a onClick={(e) => {
                  setActive(value as number)
                  e.currentTarget.parentElement?.parentElement?.blur();
                }}>{key}</a>
              </li>
          ))}
        </ul>
      </div>
  );
}
