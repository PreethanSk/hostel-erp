import MasterCrudPage from '../../components/shared/MasterCrudPage';
import { getMasterIssueCategory, insertUpdateMasterIssueCategory, deleteMasterIssueCategory } from '../../models';

export default function Index({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Issue Categories"
      description="Manage complaint/issue category classifications"
      pageAccess={PageAccess}
      formFields={[
        { name: 'issueType', label: 'Issue Type', required: true, type: 'text' },
      ]}
      apiGet={getMasterIssueCategory}
      apiSave={insertUpdateMasterIssueCategory}
      apiDelete={deleteMasterIssueCategory}
      exportFileName="Issue Category"
    />
  );
}
