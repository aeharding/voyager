import styled from "@emotion/styled";
import { chevronForward } from "ionicons/icons";
import { Link, useParams } from "react-router-dom";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import IonIconNoStroke from "../../../helpers/ionIconNoStroke";

const ContainerLink = styled(Link)`
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: 700px;
  width: calc(100vw - 1rem);
  background: var(--ion-color-primary);
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 0.75rem;

  display: flex;
  align-items: center;

  font-size: 0.85em;

  z-index: 100;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  aside {
    opacity: 0.65;
    font-weight: 400;
    font-size: 0.95em;
  }
`;

const Chevron = styled(IonIconNoStroke)`
  margin-left: auto;
  font-size: 1.5rem;
`;

export default function ViewAllComments() {
  const { community, id } = useParams<{ community: string; id: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <ContainerLink
      slot="fixed"
      to={buildGeneralBrowseLink(`/c/${community}/comments/${id}`)}
    >
      <Text>
        <div>View All Comments</div>
        <aside>This is a single comment thread from the post.</aside>
      </Text>
      <Chevron icon={chevronForward} />
    </ContainerLink>
  );
}
