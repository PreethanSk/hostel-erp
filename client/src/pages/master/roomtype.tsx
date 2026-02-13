import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterRoomType, insertUpdateMasterRoomType, deleteMasterRoomType } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Room Types"
      description="Manage room classification types (AC, Non-AC, etc.)"
      pageAccess={PageAccess}
      formFields={[
        { name: 'type', label: 'Type Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterRoomType}
      apiSave={insertUpdateMasterRoomType}
      apiDelete={deleteMasterRoomType}
      exportFileName="Room Type"
    />
  );
}
