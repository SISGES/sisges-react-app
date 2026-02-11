import './ColorPalette.css'

export function ColorPalette() {
  const colorGroups = [
    {
      title: 'Cores Principais',
      colors: [
        { name: 'Primary', var: '--color-primary', class: 'bg-primary' },
        { name: 'Primary Hover', var: '--color-primary-hover', class: 'bg-primary-hover' },
        { name: 'Accent', var: '--color-accent', class: 'bg-accent' },
      ],
    },
    {
      title: 'Estados',
      colors: [
        { name: 'Success', var: '--color-success', class: 'bg-success' },
        { name: 'Warning', var: '--color-warning', class: 'bg-warning' },
        { name: 'Error', var: '--color-error', class: 'bg-error' },
      ],
    },
    {
      title: 'Superfícies',
      colors: [
        { name: 'Background', var: '--color-background', class: 'bg-background' },
        { name: 'Surface', var: '--color-surface', class: 'bg-surface' },
        { name: 'Border', var: '--color-border', class: 'bg-border' },
      ],
    },
    {
      title: 'Textos',
      colors: [
        { name: 'Primary', var: '--color-text-primary', class: 'text-primary' },
        { name: 'Secondary', var: '--color-text-secondary', class: 'text-secondary' },
        { name: 'Muted', var: '--color-text-muted', class: 'text-muted' },
      ],
    },
  ]

  return (
    <div className="color-palette">
      <h2 className="color-palette-title">Paleta de Cores</h2>
      <div className="color-palette-grid">
        {colorGroups.map((group) => (
          <div key={group.title} className="color-group">
            <h3 className="color-group-title">{group.title}</h3>
            <div className="color-items">
              {group.colors.map((color) => (
                <div key={color.name} className="color-item">
                  <div
                    className={`color-swatch ${color.class}`}
                    style={{
                      backgroundColor: `var(${color.var})`,
                      borderColor: `var(--color-border)`,
                    }}
                  />
                  <div className="color-info">
                    <span className="color-name">{color.name}</span>
                    <span className="color-var">{color.var}</span>
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
