export default function SetupGuidePage() {
  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <h1 className="font-display text-2xl md:text-3xl font-bold">📋 Excel Setup Guide</h1>
      <p className="text-muted-foreground">How to connect your Microsoft 365 Excel workbook to this site</p>

      <section className="bg-card rounded-xl p-5 card-shadow space-y-4">
        <h2 className="font-display text-lg font-bold">Step 1: Create Your Excel Workbook</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Create a workbook in Microsoft 365 with the following sheets:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-1">Sheet: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Players</code></h3>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border">
                <thead><tr className="bg-muted"><th className="p-2 text-left">id</th><th className="p-2 text-left">name</th></tr></thead>
                <tbody><tr className="border-t"><td className="p-2">p1</td><td className="p-2">Alex M.</td></tr></tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-1">Sheet: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Picks</code></h3>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border">
                <thead><tr className="bg-muted"><th className="p-2 text-left">player_id</th><th className="p-2 text-left">player_name</th><th className="p-2 text-left">contestant_name</th><th className="p-2 text-left">rank_points</th></tr></thead>
                <tbody><tr className="border-t"><td className="p-2">p1</td><td className="p-2">Alex M.</td><td className="p-2">Emma</td><td className="p-2">18</td></tr></tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-1">Sheet: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Results</code></h3>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border">
                <thead><tr className="bg-muted"><th className="p-2 text-left">week</th><th className="p-2 text-left">episode_date</th><th className="p-2 text-left">contestant_name</th><th className="p-2 text-left">received_rose</th><th className="p-2 text-left">eliminated</th><th className="p-2 text-left">roses_this_week</th></tr></thead>
                <tbody><tr className="border-t"><td className="p-2">1</td><td className="p-2">2025-03-10</td><td className="p-2">Emma</td><td className="p-2">true</td><td className="p-2">false</td><td className="p-2">1</td></tr></tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-1">Sheet: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Announcements</code></h3>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border">
                <thead><tr className="bg-muted"><th className="p-2 text-left">date</th><th className="p-2 text-left">headline</th><th className="p-2 text-left">body</th><th className="p-2 text-left">link</th></tr></thead>
                <tbody><tr className="border-t"><td className="p-2">2025-03-10</td><td className="p-2">Welcome!</td><td className="p-2">Pool is open</td><td className="p-2">(optional)</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card rounded-xl p-5 card-shadow space-y-3">
        <h2 className="font-display text-lg font-bold">Step 2: Export to CSV (Recommended)</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p><strong>Option A — Power Automate (preferred):</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Create a Power Automate flow triggered on a schedule (e.g., every 15 minutes)</li>
            <li>Use the "List rows present in a table" action for each Excel table</li>
            <li>Use "Create file" action to write a CSV to a OneDrive/SharePoint folder</li>
            <li>Share that folder with "Anyone with the link" permissions</li>
            <li>Copy the direct download link for each CSV</li>
          </ol>

          <p className="mt-3"><strong>Option B — Direct sharing:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Save each sheet as a separate .csv file in OneDrive</li>
            <li>Share each CSV with "Anyone with the link can view"</li>
            <li>Copy the download link (may need to modify the URL to get direct download)</li>
          </ol>
        </div>
      </section>

      <section className="bg-card rounded-xl p-5 card-shadow space-y-3">
        <h2 className="font-display text-lg font-bold">Step 3: Configure the Site</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>Open <code className="bg-muted px-1.5 py-0.5 rounded text-xs">src/config.ts</code> and paste your CSV URLs:</p>
          <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
{`DATA_ENDPOINTS: {
  players_csv_url: "https://...",
  picks_csv_url: "https://...",
  results_csv_url: "https://...",
  announcements_csv_url: "https://...",
}`}
          </pre>
          <p>Also update <code className="bg-muted px-1.5 py-0.5 rounded text-xs">BUY_IN_AMOUNT</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">EPISODE_SCHEDULE</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-xs">LEAD_NAME</code> as needed.</p>
        </div>
      </section>

      <section className="bg-card rounded-xl p-5 card-shadow space-y-3">
        <h2 className="font-display text-lg font-bold">Scoring Rules</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>Players assign rank points (e.g., 18 down to 1) to remaining contestants after Episode 3</li>
            <li>Each week, if a contestant receives a rose, the player earns: <code className="bg-muted px-1 rounded text-xs">rank_points × roses_received</code></li>
            <li>Points accumulate through the season</li>
            <li>Highest total wins the pot ($BUY_IN × number of players)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
