#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires, no-console */
/**
 * Tests for create-template-module CLI — Sprint 32
 *
 * Run: node scripts/new-module.test.js
 */

const { toPascalCase, toSnakeCase, toKebabCase, toCamelCase, feTemplates, beTemplates } = require('./new-module')

let passed = 0
let failed = 0

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ ${name}`)
    passed++
  } else {
    console.error(`  ✗ ${name}`)
    failed++
  }
}

function assertEq(actual, expected, name) {
  assert(actual === expected, `${name}: "${actual}" === "${expected}"`)
}

// ============================================================================
// String helpers
// ============================================================================
console.log('\n📦 String helpers\n')

assertEq(toPascalCase('invoices'), 'Invoices', 'simple kebab')
assertEq(toPascalCase('project-management'), 'ProjectManagement', 'multi-word kebab')
assertEq(toPascalCase('user_roles'), 'UserRoles', 'snake_case input')
assertEq(toPascalCase('a'), 'A', 'single char')
assertEq(toPascalCase('file-upload'), 'FileUpload', 'two-word')

assertEq(toSnakeCase('project-management'), 'project_management', 'kebab to snake')
assertEq(toSnakeCase('ProjectManagement'), 'project_management', 'pascal to snake')
assertEq(toSnakeCase('invoices'), 'invoices', 'simple stays')

assertEq(toKebabCase('project_management'), 'project-management', 'snake to kebab')
assertEq(toKebabCase('ProjectManagement'), 'project-management', 'pascal to kebab')
assertEq(toKebabCase('invoices'), 'invoices', 'simple stays')

assertEq(toCamelCase('invoices'), 'invoices', 'simple')
assertEq(toCamelCase('project-management'), 'projectManagement', 'multi-word')
assertEq(toCamelCase('file-upload'), 'fileUpload', 'two-word')

// ============================================================================
// FE Templates
// ============================================================================
console.log('\n📦 FE Templates\n')

const feTypes = feTemplates['types.ts']('invoices', 'Invoices')
assert(feTypes.includes('interface InvoicesItem'), 'types.ts has Item interface')
assert(feTypes.includes('interface InvoicesFilters'), 'types.ts has Filters interface')
assert(feTypes.includes('interface InvoicesState'), 'types.ts has State interface')

const feIndex = feTemplates['index.ts']('invoices', 'Invoices')
assert(feIndex.includes('InvoicesPage'), 'index.ts exports Page')
assert(feIndex.includes('./types'), 'index.ts re-exports types')

const fePage = feTemplates['Page.tsx']('invoices', 'Invoices')
assert(fePage.includes('function InvoicesPage'), 'Page.tsx has component')
assert(fePage.includes('useTranslation'), 'Page.tsx uses i18n')
assert(fePage.includes('useAuth'), 'Page.tsx uses auth')

const feHooks = feTemplates['hooks/index.ts']('invoices', 'Invoices', 'invoices')
assert(feHooks.includes('useInvoicesList'), 'hooks has list hook')
assert(feHooks.includes('useInvoicesCreate'), 'hooks has create hook')
assert(feHooks.includes('@tanstack/react-query'), 'hooks imports TanStack Query')

const feService = feTemplates['services/index.ts']('invoices', 'Invoices')
assert(feService.includes("'/api/invoices'"), 'service has correct BASE path')
assert(feService.includes('invoicesService'), 'service exports named service')
assert(feService.includes('.get<InvoicesItem>'), 'service has typed get')
assert(feService.includes('.post<InvoicesItem>'), 'service has typed post')
assert(feService.includes('.delete('), 'service has delete')

// Multi-word module
const fePageMulti = feTemplates['Page.tsx']('project-management', 'ProjectManagement')
assert(fePageMulti.includes('function ProjectManagementPage'), 'multi-word Page component')

// ============================================================================
// BE Templates
// ============================================================================
console.log('\n📦 BE Templates\n')

const beRouter = beTemplates.router('invoices', 'Invoices')
assert(beRouter.includes('prefix="/api/invoices"'), 'router has correct prefix')
assert(beRouter.includes('class InvoicesCreate'), 'router has Create schema')
assert(beRouter.includes('class InvoicesUpdate'), 'router has Update schema')
assert(beRouter.includes('class InvoicesResponse'), 'router has Response schema')
assert(beRouter.includes('class InvoicesListResponse'), 'router has ListResponse schema')
assert(beRouter.includes('async def list_invoices'), 'router has list endpoint')
assert(beRouter.includes('async def get_invoices'), 'router has get endpoint')
assert(beRouter.includes('async def create_invoices'), 'router has create endpoint')
assert(beRouter.includes('async def update_invoices'), 'router has update endpoint')
assert(beRouter.includes('async def delete_invoices'), 'router has delete endpoint')
assert(beRouter.includes('HTTP_201_CREATED'), 'router POST returns 201')
assert(beRouter.includes('HTTP_204_NO_CONTENT'), 'router DELETE returns 204')

const beTest = beTemplates.test('invoices', 'Invoices')
assert(beTest.includes('class TestInvoicesRouter'), 'test has router class')
assert(beTest.includes('def test_placeholder'), 'test has placeholder')
assert(beTest.includes('/api/invoices'), 'test references correct path')

// Multi-word BE module
const beRouterMulti = beTemplates.router('project_management', 'ProjectManagement')
assert(beRouterMulti.includes('prefix="/api/project-management"'), 'multi-word router prefix uses kebab')
assert(beRouterMulti.includes('class ProjectManagementCreate'), 'multi-word schema name')

// ============================================================================
// Summary
// ============================================================================
console.log(`\n${'='.repeat(50)}`)
console.log(`Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`)
console.log(`${'='.repeat(50)}\n`)

process.exit(failed > 0 ? 1 : 0)
