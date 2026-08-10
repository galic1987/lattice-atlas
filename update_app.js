const fs = require('fs');

let content = fs.readFileSync('app/src/App.tsx', 'utf8');
content = content.replace(
  "const Capstone = lazy(() => import('@/pages/Capstone'));\nconst NotFound = lazy(() => import('@/pages/NotFound'));",
  "const Capstone = lazy(() => import('@/pages/Capstone'));\nconst LatticeSurgeryLab = lazy(() => import('@/pages/LatticeSurgeryLab'));\nconst NotFound = lazy(() => import('@/pages/NotFound'));"
);

content = content.replace(
  '<Route path="capstone" element={lazyPage(<Capstone />)} />\n          <Route path="*" element={lazyPage(<NotFound />)} />',
  '<Route path="capstone" element={lazyPage(<Capstone />)} />\n          <Route path="lattice-surgery" element={lazyPage(<LatticeSurgeryLab />)} />\n          <Route path="*" element={lazyPage(<NotFound />)} />'
);

fs.writeFileSync('app/src/App.tsx', content);
