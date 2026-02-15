import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterCotType, insertUpdateMasterCotType, deleteMasterCotType } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Bed Types"
      description="Manage bed/cot type classifications"
      pageAccess={PageAccess}
      formFields={[
        { name: 'type', label: 'Type Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterCotType}
      apiSave={insertUpdateMasterCotType}
      apiDelete={deleteMasterCotType}
      exportFileName="Bed Type"
    />
  );
}
