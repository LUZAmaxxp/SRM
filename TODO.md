# ESLint Errors Fix Plan

## Files to Edit:
- [ ] src/app/auth/forgot-password/forgot-password-form.tsx: Remove unused 't' import
- [ ] src/app/auth/reset-password/reset-password-form.tsx: Remove unused 'messages' import
- [ ] src/app/dashboard/page.tsx: Escape apostrophe in JSX
- [ ] src/app/page.tsx: Escape apostrophe in JSX
- [ ] src/components/records-table.tsx: Remove unused 'Eye' import, remove unused 'onExport' param, replace <img> with <Image>
- [ ] src/components/ui/input.tsx: Fix empty interface
- [ ] src/components/ui/textarea.tsx: Fix empty interface
- [ ] src/core/modal-views/modal.tsx: Remove unused 'onClose' param
- [ ] src/core/ui/form.tsx: Remove unused imports, fix 'any' types, remove unused 'resetValues'
- [ ] src/lib/auth.ts: Remove unused params, fix 'any' types
- [ ] src/lib/db.ts: Fix 'any' types
- [ ] src/lib/docx-generator.ts: Remove unused 'title' param
- [ ] src/lib/store.ts: Remove unused 'state' params
