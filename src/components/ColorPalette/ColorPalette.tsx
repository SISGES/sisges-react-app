export function ColorPalette() {
  const colorGroups = [
    {
      title: 'Cores Principais',
      colors: [
        { name: 'Primary', var: '--color-primary' },
        { name: 'Primary Hover', var: '--color-primary-hover' },
        { name: 'Accent', var: '--color-accent' },
      ],
    },
    {
      title: 'Estados',
      colors: [
        { name: 'Success', var: '--color-success' },
        { name: 'Warning', var: '--color-warning' },
        { name: 'Error', var: '--color-error' },
      ],
    },
    {
      title: 'Superfícies',
      colors: [
        { name: 'Background', var: '--color-background' },
        { name: 'Surface', var: '--color-surface' },
        { name: 'Border', var: '--color-border' },
      ],
    },
    {
      title: 'Textos',
      colors: [
        { name: 'Primary', var: '--color-text-primary' },
        { name: 'Secondary', var: '--color-text-secondary' },
        { name: 'Muted', var: '--color-text-muted' },
      ],
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Paleta de Cores</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {colorGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{group.title}</h3>
            <div className="space-y-2">
              {group.colors.map((color) => (
                <div key={color.name} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md border border-border shrink-0"
                    style={{ backgroundColor: `var(${color.var})` }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary">{color.name}</div>
                    <div className="text-xs text-text-muted font-mono truncate">{color.var}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
