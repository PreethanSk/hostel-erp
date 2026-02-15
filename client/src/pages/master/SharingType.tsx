import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterSharingType, insertUpdateMasterSharingType, deleteMasterSharingType } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Sharing Types"
      description="Define room sharing configurations"
      pageAccess={PageAccess}
      formFields={[
        { name: 'type', label: 'Type Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterSharingType}
      apiSave={insertUpdateMasterSharingType}
      apiDelete={deleteMasterSharingType}
      exportFileName="Sharing Type"
    />
  );
}
