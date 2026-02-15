import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterPageList, insertUpdateMasterPageList, deleteMasterPageList } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Page List"
      description="Manage system pages and routes"
      pageAccess={PageAccess}
      formFields={[
        { name: 'pageName', label: 'Page Name', required: true, type: 'text' },
        { name: 'pageURL', label: 'Page URL', type: 'text' },
      ]}
      apiGet={getMasterPageList}
      apiSave={insertUpdateMasterPageList}
      apiDelete={deleteMasterPageList}
      exportFileName="Page List"
    />
  );
}
