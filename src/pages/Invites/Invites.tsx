import React, {useState, useEffect} from 'react';
import {DataTable} from 'react-native-paper';
function Invites({navigation, route}): JSX.Element {
  const [invites, setInvites] = useState<any[]>(route.params.Invites);
  const [invitesPageNumber, setInvitesPageNumber] = React.useState<number>(0);
  const itemPerPage = 5;
  const fromInvites = invitesPageNumber * itemPerPage;
  const toInvites = Math.min(
    (invitesPageNumber + 1) * itemPerPage,
    invites.length,
  );
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Invited By</DataTable.Title>
        <DataTable.Title>Room Title</DataTable.Title>
      </DataTable.Header>

      {invites.slice(fromInvites, toInvites).map(item => (
        <DataTable.Row key={item.InviteId}>
          <DataTable.Cell>{item.InvitedBy}</DataTable.Cell>
          <DataTable.Cell>{item.Title}</DataTable.Cell>
        </DataTable.Row>
      ))}

      <DataTable.Pagination
        page={invitesPageNumber}
        numberOfPages={Math.ceil(invites.length / itemPerPage)}
        onPageChange={page => setInvitesPageNumber(page)}
        label={`${fromInvites + 1}-${toInvites} of ${invites.length}`}
        numberOfItemsPerPage={itemPerPage}
        showFastPaginationControls
      />
    </DataTable>
  );
}
export default Invites;
