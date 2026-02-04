export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <p className="text-center text-sm text-text-muted">
          Timeless Tech LTD &copy; {currentYear}
        </p>
      </div>
    </footer>
  )
}
