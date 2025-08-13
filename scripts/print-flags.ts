import { getAllFlags } from '@/lib/flags'

function main() {
  const flags = getAllFlags()
  // eslint-disable-next-line no-console
  console.info('Feature flags (computed from defaults + localStorage + URL overrides):')
  // eslint-disable-next-line no-console
  console.info(JSON.stringify(flags, null, 2))
}

main()


