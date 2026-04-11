import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as m}from"./index-BxY4JGwq.js";import{c as v}from"./clsx-B-dksMZM.js";import{S as y}from"./search-B4MFFvlx.js";import{X as f}from"./x-lWMTmhcP.js";import"./_commonjsHelpers-CqkleIqs.js";import"./createLucideIcon-DA4OzSxG.js";function o({value:a,onChange:t,placeholder:r="Search...",clearable:i=!0,className:n,...h}){return e.jsxs("div",{className:v("ds-search-filter__input-wrapper",n),children:[e.jsx("span",{className:"ds-search-filter__icon",children:e.jsx(y,{size:16})}),e.jsx("input",{type:"search",className:"ds-search-filter__input",value:a,onChange:l=>t(l.target.value),placeholder:r,"aria-label":r,...h}),i&&a&&e.jsx("button",{type:"button",className:"ds-search-filter__clear",onClick:()=>t(""),"aria-label":"Clear search",children:e.jsx(f,{size:14})})]})}function s({label:a,active:t=!1,onRemove:r,className:i,...n}){return e.jsxs("span",{className:v("ds-filter-chip",t&&"ds-filter-chip--active",i),...n,children:[a,r&&e.jsx("button",{type:"button",className:"ds-filter-chip__remove",onClick:r,"aria-label":`Remove ${a} filter`,children:e.jsx(f,{size:10})})]})}try{o.displayName="SearchFilter",o.__docgenInfo={description:"",displayName:"SearchFilter",props:{value:{defaultValue:null,description:"Valor da busca",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"Callback ao mudar",name:"onChange",required:!0,type:{name:"(value: string) => void"}},clearable:{defaultValue:{value:"true"},description:"Mostrar botão de limpar",name:"clearable",required:!1,type:{name:"boolean"}}}}}catch{}try{s.displayName="FilterChip",s.__docgenInfo={description:"",displayName:"FilterChip",props:{label:{defaultValue:null,description:"Label do filtro",name:"label",required:!0,type:{name:"string"}},active:{defaultValue:{value:"false"},description:"Se está ativo",name:"active",required:!1,type:{name:"boolean"}},onRemove:{defaultValue:null,description:"Callback para remover",name:"onRemove",required:!1,type:{name:"(() => void)"}}}}}catch{}const V={title:"Filters/SearchFilter",component:o,tags:["autodocs"]},c={render:function(){const[t,r]=m.useState("");return e.jsx("div",{style:{maxWidth:"350px"},children:e.jsx(o,{value:t,onChange:r})})}},d={render:function(){const[t,r]=m.useState("");return e.jsx("div",{style:{maxWidth:"350px"},children:e.jsx(o,{value:t,onChange:r,placeholder:"Search users by name or email..."})})}},u={render:function(){const[t,r]=m.useState(""),[i,n]=m.useState(["Active","Admin"]),h=l=>n(i.filter(x=>x!==l));return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem",maxWidth:"450px"},children:[e.jsx(o,{value:t,onChange:r,placeholder:"Search..."}),e.jsxs("div",{style:{display:"flex",gap:"0.375rem",flexWrap:"wrap"},children:[i.map(l=>e.jsx(s,{label:l,active:!0,onRemove:()=>h(l)},l)),e.jsx(s,{label:"All roles"})]})]})}},p={render:()=>e.jsxs("div",{style:{display:"flex",gap:"0.375rem",flexWrap:"wrap"},children:[e.jsx(s,{label:"Status: Active",active:!0,onRemove:()=>{}}),e.jsx(s,{label:"Role: Admin",active:!0,onRemove:()=>{}}),e.jsx(s,{label:"All departments"})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: '350px'
    }}>\r
        <SearchFilter value={value} onChange={setValue} />\r
      </div>;
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: '350px'
    }}>\r
        <SearchFilter value={value} onChange={setValue} placeholder="Search users by name or email..." />\r
      </div>;
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [value, setValue] = useState('');
    const [filters, setFilters] = useState(['Active', 'Admin']);
    const removeFilter = (f: string) => setFilters(filters.filter(x => x !== f));
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '450px'
    }}>\r
        <SearchFilter value={value} onChange={setValue} placeholder="Search..." />\r
        <div style={{
        display: 'flex',
        gap: '0.375rem',
        flexWrap: 'wrap'
      }}>\r
          {filters.map(f => <FilterChip key={f} label={f} active onRemove={() => removeFilter(f)} />)}\r
          <FilterChip label="All roles" />\r
        </div>\r
      </div>;
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap'
  }}>\r
      <FilterChip label="Status: Active" active onRemove={() => {}} />\r
      <FilterChip label="Role: Admin" active onRemove={() => {}} />\r
      <FilterChip label="All departments" />\r
    </div>
}`,...p.parameters?.docs?.source}}};const A=["Default","CustomPlaceholder","WithFilterChips","FilterChips"];export{d as CustomPlaceholder,c as Default,p as FilterChips,u as WithFilterChips,A as __namedExportsOrder,V as default};
