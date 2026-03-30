/**
 * Tests for FeatureFlags system.
 * Sprint 16: Feature Flags + Observabilidade.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  FeatureFlagsManager,
  detectEnvironment,
  DEFAULT_FEATURE_FLAGS,
  type FeatureFlagConfig,
} from '../featureFlags'

// ============================================================================
// Helpers
// ============================================================================

function createManager(): FeatureFlagsManager {
  const m = new FeatureFlagsManager()
  m.initialize(DEFAULT_FEATURE_FLAGS)
  return m
}

function customConfigs(): FeatureFlagConfig[] {
  return [
    {
      id: 'feature_a',
      name: 'Feature A',
      description: 'Test feature A',
      defaultValue: true,
    },
    {
      id: 'feature_b',
      name: 'Feature B',
      description: 'Test feature B',
      defaultValue: false,
      environments: {
        development: true,
        staging: false,
        production: false,
      },
    },
    {
      id: 'feature_c',
      name: 'Feature C',
      description: 'Prod only',
      defaultValue: false,
      environments: {
        production: true,
      },
    },
  ]
}

// ============================================================================
// detectEnvironment Tests
// ============================================================================

describe('detectEnvironment', () => {
  it('returns a valid environment string', () => {
    const env = detectEnvironment()
    expect(['development', 'staging', 'production']).toContain(env)
  })

  it('returns development in test/jsdom context', () => {
    const env = detectEnvironment()
    // jsdom sets hostname to 'localhost'
    expect(env).toBe('development')
  })
})

// ============================================================================
// FeatureFlagsManager - initialize Tests
// ============================================================================

describe('FeatureFlagsManager - initialize', () => {
  it('initializes with DEFAULT_FEATURE_FLAGS', () => {
    const m = new FeatureFlagsManager()
    m.initialize(DEFAULT_FEATURE_FLAGS)
    const flags = m.getAllFlags()
    expect(Object.keys(flags).length).toBe(DEFAULT_FEATURE_FLAGS.length)
  })

  it('sets initialized state after initialize()', () => {
    const m = new FeatureFlagsManager()
    expect(m.getAllFlags()).toEqual({})
    m.initialize(DEFAULT_FEATURE_FLAGS)
    expect(Object.keys(m.getAllFlags()).length).toBeGreaterThan(0)
  })

  it('applies environment-specific overrides for development', () => {
    const m = new FeatureFlagsManager()
    m.setEnvironment('development')
    m.initialize(customConfigs())
    // feature_b has development: true override
    expect(m.isEnabled('feature_b')).toBe(true)
  })

  it('applies environment-specific overrides for production', () => {
    const m = new FeatureFlagsManager()
    m.setEnvironment('production')
    m.initialize(customConfigs())
    // feature_b has production: false
    expect(m.isEnabled('feature_b')).toBe(false)
    // feature_c has production: true
    expect(m.isEnabled('feature_c')).toBe(true)
  })

  it('uses defaultValue when no env override exists', () => {
    const m = new FeatureFlagsManager()
    m.setEnvironment('production')
    m.initialize(customConfigs())
    // feature_a has no env overrides, defaultValue: true
    expect(m.isEnabled('feature_a')).toBe(true)
  })

  it('re-initializing clears previous flags', () => {
    const m = new FeatureFlagsManager()
    m.initialize([{ id: 'old', name: 'Old', description: '', defaultValue: true }])
    expect(m.isEnabled('old')).toBe(true)
    m.initialize(customConfigs())
    // old flag should now be unknown
    expect(m.isEnabled('old')).toBe(false)
  })
})

// ============================================================================
// FeatureFlagsManager - isEnabled Tests
// ============================================================================

describe('FeatureFlagsManager - isEnabled', () => {
  let m: FeatureFlagsManager

  beforeEach(() => {
    m = new FeatureFlagsManager()
    m.initialize(customConfigs())
  })

  it('returns true for enabled flag', () => {
    expect(m.isEnabled('feature_a')).toBe(true)
  })

  it('returns false for disabled flag', () => {
    m.setEnvironment('production')
    m.initialize(customConfigs())
    expect(m.isEnabled('feature_b')).toBe(false)
  })

  it('returns false for unknown flag', () => {
    expect(m.isEnabled('nonexistent_flag')).toBe(false)
  })

  it('returns false before initialize', () => {
    const fresh = new FeatureFlagsManager()
    expect(fresh.isEnabled('feature_a')).toBe(false)
  })
})

// ============================================================================
// FeatureFlagsManager - setFlag Tests
// ============================================================================

describe('FeatureFlagsManager - setFlag', () => {
  let m: FeatureFlagsManager

  beforeEach(() => {
    m = createManager()
  })

  it('overrides a flag to true', () => {
    m.setFlag('maintenance_mode', true)
    expect(m.isEnabled('maintenance_mode')).toBe(true)
  })

  it('overrides a flag to false', () => {
    m.setFlag('dark_mode', false)
    expect(m.isEnabled('dark_mode')).toBe(false)
  })

  it('does not set unknown flags', () => {
    m.setFlag('ghost_flag', true)
    expect(m.isEnabled('ghost_flag')).toBe(false)
  })

  it('notifies listeners on flag change', () => {
    let notified = 0
    m.subscribe(() => {
      notified++
    })
    m.setFlag('dark_mode', false)
    expect(notified).toBe(1)
  })
})

// ============================================================================
// FeatureFlagsManager - resetFlag Tests
// ============================================================================

describe('FeatureFlagsManager - resetFlag', () => {
  it('resets to default after override', () => {
    const m = createManager()
    // dark_mode defaultValue is true
    m.setFlag('dark_mode', false)
    expect(m.isEnabled('dark_mode')).toBe(false)
    m.resetFlag('dark_mode')
    expect(m.isEnabled('dark_mode')).toBe(true)
  })

  it('does not reset unknown flags', () => {
    const m = createManager()
    m.resetFlag('ghost_flag') // should not throw
    expect(m.isEnabled('ghost_flag')).toBe(false)
  })
})

// ============================================================================
// FeatureFlagsManager - getAllFlags Tests
// ============================================================================

describe('FeatureFlagsManager - getAllFlags', () => {
  it('returns all flag ids and values', () => {
    const m = new FeatureFlagsManager()
    m.initialize(customConfigs())
    const flags = m.getAllFlags()
    expect('feature_a' in flags).toBe(true)
    expect('feature_b' in flags).toBe(true)
    expect('feature_c' in flags).toBe(true)
  })

  it('returns empty object before initialize', () => {
    const m = new FeatureFlagsManager()
    expect(m.getAllFlags()).toEqual({})
  })

  it('values are boolean', () => {
    const m = createManager()
    for (const val of Object.values(m.getAllFlags())) {
      expect(typeof val).toBe('boolean')
    }
  })
})

// ============================================================================
// FeatureFlagsManager - getAllConfigs Tests
// ============================================================================

describe('FeatureFlagsManager - getAllConfigs', () => {
  it('returns all configs after initialize', () => {
    const m = new FeatureFlagsManager()
    m.initialize(customConfigs())
    const configs = m.getAllConfigs()
    expect(configs).toHaveLength(3)
    expect(configs.map(c => c.id)).toContain('feature_a')
  })

  it('each config has required fields', () => {
    const m = createManager()
    for (const config of m.getAllConfigs() as FeatureFlagConfig[]) {
      expect(config).toHaveProperty('id')
      expect(config).toHaveProperty('name')
      expect(config).toHaveProperty('description')
      expect(config).toHaveProperty('defaultValue')
    }
  })
})

// ============================================================================
// FeatureFlagsManager - subscribe Tests
// ============================================================================

describe('FeatureFlagsManager - subscribe', () => {
  it('subscribes and receives notifications', () => {
    const m = createManager()
    let count = 0
    m.subscribe(() => count++)
    m.setFlag('dark_mode', false)
    expect(count).toBe(1)
  })

  it('unsubscribes cleanly', () => {
    const m = createManager()
    let count = 0
    const unsubscribe = m.subscribe(() => count++)
    unsubscribe()
    m.setFlag('dark_mode', false)
    expect(count).toBe(0)
  })

  it('supports multiple subscribers', () => {
    const m = createManager()
    let a = 0,
      b = 0
    m.subscribe(() => a++)
    m.subscribe(() => b++)
    m.setFlag('dark_mode', false)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

// ============================================================================
// FeatureFlagsManager - setEnvironment Tests
// ============================================================================

describe('FeatureFlagsManager - setEnvironment', () => {
  it('returns correct environment after setEnvironment', () => {
    const m = new FeatureFlagsManager()
    m.setEnvironment('production')
    expect(m.getEnvironment()).toBe('production')
  })

  it('re-applies flags after setEnvironment when initialized', () => {
    const m = new FeatureFlagsManager()
    m.setEnvironment('development')
    m.initialize(customConfigs())
    expect(m.isEnabled('feature_b')).toBe(true) // dev: true

    m.setEnvironment('production')
    expect(m.isEnabled('feature_b')).toBe(false) // prod: false
  })
})

// ============================================================================
// DEFAULT_FEATURE_FLAGS Tests
// ============================================================================

describe('DEFAULT_FEATURE_FLAGS', () => {
  it('contains expected flags', () => {
    const ids = DEFAULT_FEATURE_FLAGS.map(f => f.id)
    expect(ids).toContain('dark_mode')
    expect(ids).toContain('new_dashboard')
    expect(ids).toContain('experimental_features')
    expect(ids).toContain('analytics')
    expect(ids).toContain('maintenance_mode')
  })

  it('maintenance_mode is disabled by default', () => {
    const flag = DEFAULT_FEATURE_FLAGS.find(f => f.id === 'maintenance_mode')
    expect(flag?.defaultValue).toBe(false)
  })

  it('dark_mode is enabled by default', () => {
    const flag = DEFAULT_FEATURE_FLAGS.find(f => f.id === 'dark_mode')
    expect(flag?.defaultValue).toBe(true)
  })

  it('experimental_features is disabled in production', () => {
    const flag = DEFAULT_FEATURE_FLAGS.find(f => f.id === 'experimental_features')
    expect(flag?.environments?.production).toBe(false)
  })

  it('experimental_features is enabled in development', () => {
    const flag = DEFAULT_FEATURE_FLAGS.find(f => f.id === 'experimental_features')
    expect(flag?.environments?.development).toBe(true)
  })
})
