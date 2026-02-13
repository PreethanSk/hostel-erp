import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getServiceProviderCategory, insertUpdateServiceProviderCategory } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Service Provider Categories"
      description="Manage service provider category types"
      pageAccess={PageAccess}
      formFields={[
        { name: 'name', label: 'Category Name', required: true, type: 'text' },
        { name: 'description', label: 'Description', type: 'text' },
      ]}
      apiGet={getServiceProviderCategory}
      apiSave={insertUpdateServiceProviderCategory}
      hideNotes
      exportFileName="Service Provider Category"
    />
  );
}
