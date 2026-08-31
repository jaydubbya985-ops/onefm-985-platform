/** Empty-state for DEMO chart series that must not appear in live #/ops. */
export function LivePendingNote({
  title,
  detail,
}: {
  title: string
  detail?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center min-h-[160px] rounded-lg border border-[#2A2A2A]/30 bg-[#101010]/40">
      <p className="text-one-white/80 text-sm font-medium">{title}</p>
      <p className="text-one-white/40 text-xs mt-2 max-w-md">
        {detail ??
          'DEMO figures are hidden in live mode. This fills in once station-audited data is loaded.'}
      </p>
    </div>
  )
}
