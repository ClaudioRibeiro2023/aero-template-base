import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as g}from"./index-BxY4JGwq.js";import{c as p}from"./clsx-B-dksMZM.js";/* empty css              */import{c as v}from"./createLucideIcon-DA4OzSxG.js";import{C as D}from"./chevron-down-BS89M68v.js";import{S as R}from"./StatusBadge-CmSLrW55.js";import"./_commonjsHelpers-CqkleIqs.js";const N=v("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);const B=v("ChevronsUpDown",[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]]);function i({size:a="md",striped:s=!1,hoverable:l=!0,bordered:d=!1,className:t,children:m,...h}){return e.jsx("div",{className:"ds-table-container",children:e.jsx("table",{className:p("ds-table",`ds-table--${a}`,s&&"ds-table--striped",l&&"ds-table--hoverable",d&&"ds-table--bordered",t),...h,children:m})})}function c({className:a,children:s,...l}){return e.jsx("thead",{className:p("ds-table__head",a),...l,children:s})}function b({className:a,children:s,...l}){return e.jsx("tbody",{className:p("ds-table__body",a),...l,children:s})}function o({selected:a=!1,className:s,children:l,...d}){return e.jsx("tr",{className:p("ds-table__row",a&&"ds-table__row--selected",s),...d,children:l})}function r({sortable:a=!1,sortDirection:s=null,onSort:l,className:d,children:t,...m}){const h=()=>{a&&l&&l()};return e.jsx("th",{className:p("ds-table__th",a&&"ds-table__th--sortable",d),onClick:h,"aria-sort":s==="asc"?"ascending":s==="desc"?"descending":void 0,...m,children:e.jsxs("div",{className:"ds-table__th-content",children:[e.jsx("span",{children:t}),a&&e.jsx("span",{className:"ds-table__sort-icon",children:s==="asc"?e.jsx(N,{size:14}):s==="desc"?e.jsx(D,{size:14}):e.jsx(B,{size:14})})]})})}function n({className:a,children:s,...l}){return e.jsx("td",{className:p("ds-table__td",a),...l,children:s})}function E(a,s){const[l,d]=g.useState(s),[t,m]=g.useState(null),h=T=>{l===T?m(x=>x===null?"asc":x==="asc"?"desc":null):(d(T),m("asc"))};return{sortedData:[...a].sort((T,x)=>{if(!l||!t)return 0;const f=T[l],w=x[l];return f<w?t==="asc"?-1:1:f>w?t==="asc"?1:-1:0}),sortKey:l,sortDirection:t,handleSort:h,getSortDirection:T=>l===T?t:null}}try{i.displayName="Table",i.__docgenInfo={description:"",displayName:"Table",props:{size:{defaultValue:{value:"md"},description:"Tamanho da tabela",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},striped:{defaultValue:{value:"false"},description:"Bordas entre linhas",name:"striped",required:!1,type:{name:"boolean"}},hoverable:{defaultValue:{value:"true"},description:"Hover nas linhas",name:"hoverable",required:!1,type:{name:"boolean"}},bordered:{defaultValue:{value:"false"},description:"Bordas",name:"bordered",required:!1,type:{name:"boolean"}}}}}catch{}try{c.displayName="TableHead",c.__docgenInfo={description:"",displayName:"TableHead",props:{}}}catch{}try{b.displayName="TableBody",b.__docgenInfo={description:"",displayName:"TableBody",props:{}}}catch{}try{o.displayName="TableRow",o.__docgenInfo={description:"",displayName:"TableRow",props:{selected:{defaultValue:{value:"false"},description:"Linha selecionada",name:"selected",required:!1,type:{name:"boolean"}}}}}catch{}try{r.displayName="TableHeaderCell",r.__docgenInfo={description:"",displayName:"TableHeaderCell",props:{sortable:{defaultValue:{value:"false"},description:"Permite ordenação",name:"sortable",required:!1,type:{name:"boolean"}},sortDirection:{defaultValue:{value:"null"},description:"Direção atual da ordenação",name:"sortDirection",required:!1,type:{name:"SortDirection"}},onSort:{defaultValue:null,description:"Callback ao ordenar",name:"onSort",required:!1,type:{name:"(() => void)"}}}}}catch{}try{n.displayName="TableCell",n.__docgenInfo={description:"",displayName:"TableCell",props:{}}}catch{}const K={title:"Components/Table",component:i,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},u=[{id:1,name:"Alice Silva",email:"alice@example.com",role:"Admin",status:"active"},{id:2,name:"Bob Santos",email:"bob@example.com",role:"Editor",status:"active"},{id:3,name:"Carol Lima",email:"carol@example.com",role:"Viewer",status:"inactive"},{id:4,name:"David Costa",email:"david@example.com",role:"Editor",status:"active"},{id:5,name:"Eva Souza",email:"eva@example.com",role:"Admin",status:"pending"}],C={render:()=>e.jsxs(i,{children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"Name"}),e.jsx(r,{children:"Email"}),e.jsx(r,{children:"Role"}),e.jsx(r,{children:"Status"})]})}),e.jsx(b,{children:u.map(a=>e.jsxs(o,{children:[e.jsx(n,{children:a.name}),e.jsx(n,{children:a.email}),e.jsx(n,{children:a.role}),e.jsx(n,{children:e.jsx(R,{variant:a.status==="active"?"success":a.status==="pending"?"warning":"error",children:a.status})})]},a.id))})]})},j={render:()=>e.jsxs(i,{striped:!0,children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"Name"}),e.jsx(r,{children:"Email"}),e.jsx(r,{children:"Role"})]})}),e.jsx(b,{children:u.map(a=>e.jsxs(o,{children:[e.jsx(n,{children:a.name}),e.jsx(n,{children:a.email}),e.jsx(n,{children:a.role})]},a.id))})]})},_={render:()=>e.jsxs(i,{bordered:!0,children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"Name"}),e.jsx(r,{children:"Email"}),e.jsx(r,{children:"Role"})]})}),e.jsx(b,{children:u.map(a=>e.jsxs(o,{children:[e.jsx(n,{children:a.name}),e.jsx(n,{children:a.email}),e.jsx(n,{children:a.role})]},a.id))})]})},y={render:()=>e.jsxs(i,{size:"sm",children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"ID"}),e.jsx(r,{children:"Name"}),e.jsx(r,{children:"Role"})]})}),e.jsx(b,{children:u.map(a=>e.jsxs(o,{children:[e.jsx(n,{children:a.id}),e.jsx(n,{children:a.name}),e.jsx(n,{children:a.role})]},a.id))})]})},H={render:function(){const{sortedData:s,getSortDirection:l,handleSort:d}=E(u,"name");return e.jsxs(i,{children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{sortable:!0,sortDirection:l("name"),onSort:()=>d("name"),children:"Name"}),e.jsx(r,{sortable:!0,sortDirection:l("email"),onSort:()=>d("email"),children:"Email"}),e.jsx(r,{sortable:!0,sortDirection:l("role"),onSort:()=>d("role"),children:"Role"}),e.jsx(r,{children:"Status"})]})}),e.jsx(b,{children:s.map(t=>e.jsxs(o,{children:[e.jsx(n,{children:t.name}),e.jsx(n,{children:t.email}),e.jsx(n,{children:t.role}),e.jsx(n,{children:e.jsx(R,{variant:t.status==="active"?"success":t.status==="pending"?"warning":"error",children:t.status})})]},t.id))})]})}},S={render:()=>e.jsxs(i,{children:[e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"Name"}),e.jsx(r,{children:"Email"})]})}),e.jsx(b,{children:u.map(a=>e.jsxs(o,{selected:a.id===2,children:[e.jsx(n,{children:a.name}),e.jsx(n,{children:a.email})]},a.id))})]})};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableHead>\r
        <TableRow>\r
          <TableHeaderCell>Name</TableHeaderCell>\r
          <TableHeaderCell>Email</TableHeaderCell>\r
          <TableHeaderCell>Role</TableHeaderCell>\r
          <TableHeaderCell>Status</TableHeaderCell>\r
        </TableRow>\r
      </TableHead>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.id}>\r
            <TableCell>{row.name}</TableCell>\r
            <TableCell>{row.email}</TableCell>\r
            <TableCell>{row.role}</TableCell>\r
            <TableCell>\r
              <StatusBadge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>\r
                {row.status}\r
              </StatusBadge>\r
            </TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,...C.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Table striped>\r
      <TableHead>\r
        <TableRow>\r
          <TableHeaderCell>Name</TableHeaderCell>\r
          <TableHeaderCell>Email</TableHeaderCell>\r
          <TableHeaderCell>Role</TableHeaderCell>\r
        </TableRow>\r
      </TableHead>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.id}>\r
            <TableCell>{row.name}</TableCell>\r
            <TableCell>{row.email}</TableCell>\r
            <TableCell>{row.role}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,...j.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Table bordered>\r
      <TableHead>\r
        <TableRow>\r
          <TableHeaderCell>Name</TableHeaderCell>\r
          <TableHeaderCell>Email</TableHeaderCell>\r
          <TableHeaderCell>Role</TableHeaderCell>\r
        </TableRow>\r
      </TableHead>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.id}>\r
            <TableCell>{row.name}</TableCell>\r
            <TableCell>{row.email}</TableCell>\r
            <TableCell>{row.role}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,..._.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Table size="sm">\r
      <TableHead>\r
        <TableRow>\r
          <TableHeaderCell>ID</TableHeaderCell>\r
          <TableHeaderCell>Name</TableHeaderCell>\r
          <TableHeaderCell>Role</TableHeaderCell>\r
        </TableRow>\r
      </TableHead>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.id}>\r
            <TableCell>{row.id}</TableCell>\r
            <TableCell>{row.name}</TableCell>\r
            <TableCell>{row.role}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,...y.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: function SortableTable() {
    const {
      sortedData,
      getSortDirection,
      handleSort
    } = useTableSort(sampleData, 'name');
    return <Table>\r
        <TableHead>\r
          <TableRow>\r
            <TableHeaderCell sortable sortDirection={getSortDirection('name')} onSort={() => handleSort('name')}>\r
              Name\r
            </TableHeaderCell>\r
            <TableHeaderCell sortable sortDirection={getSortDirection('email')} onSort={() => handleSort('email')}>\r
              Email\r
            </TableHeaderCell>\r
            <TableHeaderCell sortable sortDirection={getSortDirection('role')} onSort={() => handleSort('role')}>\r
              Role\r
            </TableHeaderCell>\r
            <TableHeaderCell>Status</TableHeaderCell>\r
          </TableRow>\r
        </TableHead>\r
        <TableBody>\r
          {sortedData.map(row => <TableRow key={row.id}>\r
              <TableCell>{row.name}</TableCell>\r
              <TableCell>{row.email}</TableCell>\r
              <TableCell>{row.role}</TableCell>\r
              <TableCell>\r
                <StatusBadge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>\r
                  {row.status}\r
                </StatusBadge>\r
              </TableCell>\r
            </TableRow>)}\r
        </TableBody>\r
      </Table>;
  }
}`,...H.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableHead>\r
        <TableRow>\r
          <TableHeaderCell>Name</TableHeaderCell>\r
          <TableHeaderCell>Email</TableHeaderCell>\r
        </TableRow>\r
      </TableHead>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.id} selected={row.id === 2}>\r
            <TableCell>{row.name}</TableCell>\r
            <TableCell>{row.email}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,...S.parameters?.docs?.source}}};const O=["Default","Striped","Bordered","SmallSize","WithSorting","WithSelectedRow"];export{_ as Bordered,C as Default,y as SmallSize,j as Striped,S as WithSelectedRow,H as WithSorting,O as __namedExportsOrder,K as default};
