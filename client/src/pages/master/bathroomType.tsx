import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterBathroomType, insertUpdateMasterBathroomType, deleteMasterBathroomType } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Bathroom Types"
      description="Manage bathroom configurations"
      pageAccess={PageAccess}
      formFields={[
        { name: 'type', label: 'Type Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterBathroomType}
      apiSave={insertUpdateMasterBathroomType}
      apiDelete={deleteMasterBathroomType}
      exportFileName="Bathroom Type"
    />
  );
}
