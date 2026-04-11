import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as y}from"./index-BxY4JGwq.js";import{c as p}from"./clsx-B-dksMZM.js";/* empty css             */import{H as z}from"./home-t1zg2Skf.js";import{U as L}from"./user-DdIXiGSf.js";import{S as I}from"./settings-CG7BJskn.js";import"./_commonjsHelpers-CqkleIqs.js";import"./createLucideIcon-DA4OzSxG.js";const N=y.createContext(null);function S(){const a=y.useContext(N);if(!a)throw new Error("Tabs components must be used within a Tabs provider");return a}function n({defaultValue:a,value:l,onChange:t,variant:c="line",size:o="md",className:u,children:f,...P}){const[_,A]=y.useState(a||""),b=l!==void 0?l:_,C=V=>{l===void 0&&A(V),t?.(V)};return e.jsx(N.Provider,{value:{activeTab:b,setActiveTab:C,variant:c,size:o},children:e.jsx("div",{className:p("ds-tabs",u),...P,children:f})})}function i({className:a,children:l,...t}){const{variant:c}=S();return e.jsx("div",{className:p("ds-tabs__list",`ds-tabs__list--${c}`,a),role:"tablist",...t,children:l})}function r({value:a,icon:l,disabled:t=!1,className:c,children:o,...u}){const{activeTab:f,setActiveTab:P,variant:_,size:A}=S(),b=f===a;return e.jsxs("button",{type:"button",role:"tab","aria-selected":b?"true":"false","aria-controls":`tabpanel-${a}`,id:`tab-${a}`,tabIndex:b?0:-1,disabled:t,className:p("ds-tabs__tab",`ds-tabs__tab--${_}`,`ds-tabs__tab--${A}`,b&&"ds-tabs__tab--active",c),onClick:()=>P(a),...u,children:[l&&e.jsx("span",{className:"ds-tabs__tab-icon",children:l}),e.jsx("span",{className:"ds-tabs__tab-text",children:o})]})}function d({className:a,children:l,...t}){return e.jsx("div",{className:p("ds-tabs__panels",a),...t,children:l})}function s({value:a,className:l,children:t,...c}){const{activeTab:o}=S();return o===a?e.jsx("div",{role:"tabpanel",id:`tabpanel-${a}`,"aria-labelledby":`tab-${a}`,tabIndex:0,className:p("ds-tabs__panel",l),...c,children:t}):null}try{n.displayName="Tabs",n.__docgenInfo={description:"",displayName:"Tabs",props:{defaultValue:{defaultValue:null,description:"ID da aba ativa inicial",name:"defaultValue",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"ID da aba ativa (controlado)",name:"value",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"Callback quando aba muda",name:"onChange",required:!1,type:{name:"((value: string) => void)"}},variant:{defaultValue:{value:"line"},description:"Variante visual",name:"variant",required:!1,type:{name:"enum",value:[{value:'"line"'},{value:'"pills"'},{value:'"enclosed"'}]}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}}}}}catch{}try{i.displayName="TabList",i.__docgenInfo={description:"",displayName:"TabList",props:{}}}catch{}try{r.displayName="Tab",r.__docgenInfo={description:"",displayName:"Tab",props:{value:{defaultValue:null,description:"ID único da aba",name:"value",required:!0,type:{name:"string"}},icon:{defaultValue:null,description:"Ícone opcional",name:"icon",required:!1,type:{name:"ReactNode"}},disabled:{defaultValue:{value:"false"},description:"Desabilitado",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}try{d.displayName="TabPanels",d.__docgenInfo={description:"",displayName:"TabPanels",props:{}}}catch{}try{s.displayName="TabPanel",s.__docgenInfo={description:"",displayName:"TabPanel",props:{value:{defaultValue:null,description:"ID correspondente à aba",name:"value",required:!0,type:{name:"string"}}}}}catch{}const k={title:"Components/Tabs",component:n,tags:["autodocs"],argTypes:{variant:{control:"select",options:["line","pills","enclosed"]},size:{control:"select",options:["sm","md","lg"]}}},m={render:()=>e.jsxs(n,{defaultValue:"overview",children:[e.jsxs(i,{children:[e.jsx(r,{value:"overview",children:"Overview"}),e.jsx(r,{value:"analytics",children:"Analytics"}),e.jsx(r,{value:"settings",children:"Settings"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"overview",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Overview content goes here."})}),e.jsx(s,{value:"analytics",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Analytics charts and data."})}),e.jsx(s,{value:"settings",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Application settings."})})]})]})},v={render:()=>e.jsxs(n,{defaultValue:"tab1",variant:"pills",children:[e.jsxs(i,{children:[e.jsx(r,{value:"tab1",children:"All"}),e.jsx(r,{value:"tab2",children:"Active"}),e.jsx(r,{value:"tab3",children:"Archived"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"tab1",children:e.jsx("p",{style:{padding:"1rem 0"},children:"All items."})}),e.jsx(s,{value:"tab2",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Active items only."})}),e.jsx(s,{value:"tab3",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Archived items."})})]})]})},T={render:()=>e.jsxs(n,{defaultValue:"tab1",variant:"enclosed",children:[e.jsxs(i,{children:[e.jsx(r,{value:"tab1",children:"General"}),e.jsx(r,{value:"tab2",children:"Security"}),e.jsx(r,{value:"tab3",children:"Notifications"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"tab1",children:e.jsx("p",{style:{padding:"1rem 0"},children:"General settings."})}),e.jsx(s,{value:"tab2",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Security configuration."})}),e.jsx(s,{value:"tab3",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Notification preferences."})})]})]})},h={render:()=>e.jsxs(n,{defaultValue:"home",children:[e.jsxs(i,{children:[e.jsx(r,{value:"home",icon:e.jsx(z,{size:16}),children:"Home"}),e.jsx(r,{value:"profile",icon:e.jsx(L,{size:16}),children:"Profile"}),e.jsx(r,{value:"settings",icon:e.jsx(I,{size:16}),children:"Settings"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"home",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Home dashboard."})}),e.jsx(s,{value:"profile",children:e.jsx("p",{style:{padding:"1rem 0"},children:"User profile."})}),e.jsx(s,{value:"settings",children:e.jsx("p",{style:{padding:"1rem 0"},children:"App settings."})})]})]})},x={render:()=>e.jsxs(n,{defaultValue:"tab1",children:[e.jsxs(i,{children:[e.jsx(r,{value:"tab1",children:"Available"}),e.jsx(r,{value:"tab2",disabled:!0,children:"Premium (Locked)"}),e.jsx(r,{value:"tab3",children:"Help"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"tab1",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Free content."})}),e.jsx(s,{value:"tab2",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Premium content."})}),e.jsx(s,{value:"tab3",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Help & support."})})]})]})},g={render:function(){const[l,t]=y.useState("tab1");return e.jsxs("div",{children:[e.jsxs("p",{style:{marginBottom:"0.5rem",fontSize:"0.875rem",color:"#64748b"},children:["Active tab: ",e.jsx("strong",{children:l})]}),e.jsxs(n,{value:l,onChange:t,children:[e.jsxs(i,{children:[e.jsx(r,{value:"tab1",children:"First"}),e.jsx(r,{value:"tab2",children:"Second"}),e.jsx(r,{value:"tab3",children:"Third"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"tab1",children:e.jsx("p",{style:{padding:"1rem 0"},children:"First panel."})}),e.jsx(s,{value:"tab2",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Second panel."})}),e.jsx(s,{value:"tab3",children:e.jsx("p",{style:{padding:"1rem 0"},children:"Third panel."})})]})]})]})}},j={render:()=>e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"2rem"},children:["sm","md","lg"].map(a=>e.jsxs("div",{children:[e.jsxs("p",{style:{marginBottom:"0.5rem",fontWeight:600},children:["Size: ",a]}),e.jsxs(n,{defaultValue:"a",size:a,children:[e.jsxs(i,{children:[e.jsx(r,{value:"a",children:"Tab A"}),e.jsx(r,{value:"b",children:"Tab B"})]}),e.jsxs(d,{children:[e.jsx(s,{value:"a",children:e.jsxs("p",{style:{padding:"0.5rem 0"},children:["Content A (",a,")"]})}),e.jsx(s,{value:"b",children:e.jsxs("p",{style:{padding:"0.5rem 0"},children:["Content B (",a,")"]})})]})]})]},a))})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="overview">\r
      <TabList>\r
        <Tab value="overview">Overview</Tab>\r
        <Tab value="analytics">Analytics</Tab>\r
        <Tab value="settings">Settings</Tab>\r
      </TabList>\r
      <TabPanels>\r
        <TabPanel value="overview">\r
          <p style={{
          padding: '1rem 0'
        }}>Overview content goes here.</p>\r
        </TabPanel>\r
        <TabPanel value="analytics">\r
          <p style={{
          padding: '1rem 0'
        }}>Analytics charts and data.</p>\r
        </TabPanel>\r
        <TabPanel value="settings">\r
          <p style={{
          padding: '1rem 0'
        }}>Application settings.</p>\r
        </TabPanel>\r
      </TabPanels>\r
    </Tabs>
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1" variant="pills">\r
      <TabList>\r
        <Tab value="tab1">All</Tab>\r
        <Tab value="tab2">Active</Tab>\r
        <Tab value="tab3">Archived</Tab>\r
      </TabList>\r
      <TabPanels>\r
        <TabPanel value="tab1">\r
          <p style={{
          padding: '1rem 0'
        }}>All items.</p>\r
        </TabPanel>\r
        <TabPanel value="tab2">\r
          <p style={{
          padding: '1rem 0'
        }}>Active items only.</p>\r
        </TabPanel>\r
        <TabPanel value="tab3">\r
          <p style={{
          padding: '1rem 0'
        }}>Archived items.</p>\r
        </TabPanel>\r
      </TabPanels>\r
    </Tabs>
}`,...v.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1" variant="enclosed">\r
      <TabList>\r
        <Tab value="tab1">General</Tab>\r
        <Tab value="tab2">Security</Tab>\r
        <Tab value="tab3">Notifications</Tab>\r
      </TabList>\r
      <TabPanels>\r
        <TabPanel value="tab1">\r
          <p style={{
          padding: '1rem 0'
        }}>General settings.</p>\r
        </TabPanel>\r
        <TabPanel value="tab2">\r
          <p style={{
          padding: '1rem 0'
        }}>Security configuration.</p>\r
        </TabPanel>\r
        <TabPanel value="tab3">\r
          <p style={{
          padding: '1rem 0'
        }}>Notification preferences.</p>\r
        </TabPanel>\r
      </TabPanels>\r
    </Tabs>
}`,...T.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="home">\r
      <TabList>\r
        <Tab value="home" icon={<Home size={16} />}>\r
          Home\r
        </Tab>\r
        <Tab value="profile" icon={<User size={16} />}>\r
          Profile\r
        </Tab>\r
        <Tab value="settings" icon={<Settings size={16} />}>\r
          Settings\r
        </Tab>\r
      </TabList>\r
      <TabPanels>\r
        <TabPanel value="home">\r
          <p style={{
          padding: '1rem 0'
        }}>Home dashboard.</p>\r
        </TabPanel>\r
        <TabPanel value="profile">\r
          <p style={{
          padding: '1rem 0'
        }}>User profile.</p>\r
        </TabPanel>\r
        <TabPanel value="settings">\r
          <p style={{
          padding: '1rem 0'
        }}>App settings.</p>\r
        </TabPanel>\r
      </TabPanels>\r
    </Tabs>
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1">\r
      <TabList>\r
        <Tab value="tab1">Available</Tab>\r
        <Tab value="tab2" disabled>\r
          Premium (Locked)\r
        </Tab>\r
        <Tab value="tab3">Help</Tab>\r
      </TabList>\r
      <TabPanels>\r
        <TabPanel value="tab1">\r
          <p style={{
          padding: '1rem 0'
        }}>Free content.</p>\r
        </TabPanel>\r
        <TabPanel value="tab2">\r
          <p style={{
          padding: '1rem 0'
        }}>Premium content.</p>\r
        </TabPanel>\r
        <TabPanel value="tab3">\r
          <p style={{
          padding: '1rem 0'
        }}>Help &amp; support.</p>\r
        </TabPanel>\r
      </TabPanels>\r
    </Tabs>
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: function ControlledTabs() {
    const [tab, setTab] = useState('tab1');
    return <div>\r
        <p style={{
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>\r
          Active tab: <strong>{tab}</strong>\r
        </p>\r
        <Tabs value={tab} onChange={setTab}>\r
          <TabList>\r
            <Tab value="tab1">First</Tab>\r
            <Tab value="tab2">Second</Tab>\r
            <Tab value="tab3">Third</Tab>\r
          </TabList>\r
          <TabPanels>\r
            <TabPanel value="tab1">\r
              <p style={{
              padding: '1rem 0'
            }}>First panel.</p>\r
            </TabPanel>\r
            <TabPanel value="tab2">\r
              <p style={{
              padding: '1rem 0'
            }}>Second panel.</p>\r
            </TabPanel>\r
            <TabPanel value="tab3">\r
              <p style={{
              padding: '1rem 0'
            }}>Third panel.</p>\r
            </TabPanel>\r
          </TabPanels>\r
        </Tabs>\r
      </div>;
  }
}`,...g.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>\r
      {(['sm', 'md', 'lg'] as const).map(size => <div key={size}>\r
          <p style={{
        marginBottom: '0.5rem',
        fontWeight: 600
      }}>Size: {size}</p>\r
          <Tabs defaultValue="a" size={size}>\r
            <TabList>\r
              <Tab value="a">Tab A</Tab>\r
              <Tab value="b">Tab B</Tab>\r
            </TabList>\r
            <TabPanels>\r
              <TabPanel value="a">\r
                <p style={{
              padding: '0.5rem 0'
            }}>Content A ({size})</p>\r
              </TabPanel>\r
              <TabPanel value="b">\r
                <p style={{
              padding: '0.5rem 0'
            }}>Content B ({size})</p>\r
              </TabPanel>\r
            </TabPanels>\r
          </Tabs>\r
        </div>)}\r
    </div>
}`,...j.parameters?.docs?.source}}};const O=["Default","Pills","Enclosed","WithIcons","WithDisabled","Controlled","AllSizes"];export{j as AllSizes,g as Controlled,m as Default,T as Enclosed,v as Pills,x as WithDisabled,h as WithIcons,O as __namedExportsOrder,k as default};
