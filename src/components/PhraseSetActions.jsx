import React from "react";
import styled, { css } from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import supabase from "../supabaseClient";
import { FONT_FAMILY, FONT_SIZE, QUERIES } from "../constants";
import BusyMessage from "./BusyMessage";
import Button from "./Button";
import Icon from "./Icon";
import Message from "./Message";
import Select from "./Select";
import UnstyledButton from "./UnstyledButton";

function AddPhraseSetDialog({ onChanged }) {
  const nameInputId = React.useId();
  const descriptionInputId = React.useId();
  const passwordInputId = React.useId();
  const creatorInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [creator, setCreator] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !password.trim()) {
      setStatus("error");
      setErrorMsg("词汇集名称和密钥不能为空。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    const { error } = await supabase.from("vocabulary_sets").insert({
      name: name.trim(),
      description: description.trim() || null,
      password: password.trim(),
      creator: creator.trim() || null,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setName("");
    setDescription("");
    setPassword("");
    setCreator("");
    setStatus("success");
    onChanged?.();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <TriggerButton type="button" aria-label="添加新的词汇集">
          <Icon id="folderPlus" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Close asChild>
            <CloseButton type="button" aria-label="关闭">
              <IconWrapper id="close" size="1.3rem" />
            </CloseButton>
          </Close>
          <Title>
            <TitleWord>添加词汇集</TitleWord>
            <TitleHint>vocabulary_sets</TitleHint>
          </Title>

          <Form onSubmit={handleSubmit}>
            <StatusArea>
              {status === "busy" && <BusyMessage>请稍等</BusyMessage>}
              {status === "error" && (
                <Message fontSize={FONT_SIZE.default} type="error">
                  发生错误: {errorMsg}
                </Message>
              )}
              {status === "success" && (
                <Message fontSize={FONT_SIZE.default} type="success">
                  添加成功。
                </Message>
              )}
            </StatusArea>

            <Fields>
              <Row>
                <Label htmlFor={nameInputId}>名称</Label>
                <Input
                  id={nameInputId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={status === "busy"}
                />
              </Row>
              <Row>
                <Label htmlFor={descriptionInputId}>描述</Label>
                <Textarea
                  id={descriptionInputId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
              <Row>
                <Label htmlFor={passwordInputId}>密钥</Label>
                <Input
                  id={passwordInputId}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={status === "busy"}
                />
              </Row>
              <Row>
                <Label htmlFor={creatorInputId}>创建者</Label>
                <Input
                  id={creatorInputId}
                  value={creator}
                  onChange={(event) => setCreator(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
            </Fields>

            <ButtonWrapper>
              <Button disabled={status === "busy"}>添加</Button>
            </ButtonWrapper>
          </Form>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeletePhraseSetDialog({ selectedPhraseSets, onChanged }) {
  const passwordInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  const hasSelection = selectedPhraseSets.length > 0;

  function handleOpenChange(nextIsOpen) {
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      setPassword("");
      setStatus("free");
      setErrorMsg("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasSelection) {
      setStatus("error");
      setErrorMsg("请先选择要删除的词汇集。");
      return;
    }

    const inputPassword = password.trim();
    const hasPasswordMismatch = selectedPhraseSets.some(
      (phraseSet) => phraseSet.password !== inputPassword
    );

    if (hasPasswordMismatch) {
      setStatus("error");
      setErrorMsg("词汇集密钥不正确。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    const selectedIds = selectedPhraseSets.map((phraseSet) => phraseSet.id);
    const { error } = await supabase
      .from("vocabulary_sets")
      .delete()
      .in("id", selectedIds);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setPassword("");
    setStatus("success");
    onChanged?.();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <TriggerButton type="button" aria-label="删除已选词汇集">
          <Icon id="remove" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Close asChild>
            <CloseButton type="button" aria-label="关闭">
              <IconWrapper id="close" size="1.3rem" />
            </CloseButton>
          </Close>
          <Title>
            <TitleWord>删除词汇集</TitleWord>
            <TitleHint>{selectedPhraseSets.length} 个已选</TitleHint>
          </Title>

          <Form onSubmit={handleSubmit}>
            <StatusArea>
              {status === "busy" && <BusyMessage>删除中</BusyMessage>}
              {status === "error" && (
                <Message fontSize={FONT_SIZE.default} type="error">
                  发生错误: {errorMsg}
                </Message>
              )}
              {status === "success" && (
                <Message fontSize={FONT_SIZE.default} type="success">
                  删除成功。
                </Message>
              )}
            </StatusArea>

            <Fields>
              <SelectedList>
                {hasSelection
                  ? selectedPhraseSets.map((phraseSet) => (
                      <SelectedItem key={phraseSet.id}>
                        {phraseSet.name}
                      </SelectedItem>
                    ))
                  : "还没有选择词汇集。"}
              </SelectedList>
              <Row>
                <Label htmlFor={passwordInputId}>密钥</Label>
                <Input
                  id={passwordInputId}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={status === "busy" || !hasSelection}
                />
              </Row>
            </Fields>

            <ButtonWrapper>
              <Button disabled={status === "busy" || !hasSelection}>
                删除
              </Button>
            </ButtonWrapper>
          </Form>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditPhraseSetDialog({ selectedPhraseSet, onChanged }) {
  const nameInputId = React.useId();
  const descriptionInputId = React.useId();
  const creatorInputId = React.useId();
  const statusSelectId = React.useId();
  const passwordInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [creator, setCreator] = React.useState("");
  const [openStatus, setOpenStatus] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  function handleOpenChange(nextIsOpen) {
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      setName(selectedPhraseSet?.name ?? "");
      setDescription(selectedPhraseSet?.description ?? "");
      setCreator(selectedPhraseSet?.creator ?? "");
      setOpenStatus(selectedPhraseSet?.status ?? "open");
      setPassword("");
      setStatus("free");
      setErrorMsg("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedPhraseSet) {
      setStatus("error");
      setErrorMsg("请先选择要编辑的词汇集。");
      return;
    }

    if (password.trim() !== selectedPhraseSet.password) {
      setStatus("error");
      setErrorMsg("词汇集密钥不正确。");
      return;
    }

    const nextName = name.trim();
    const nextDescription = description.trim();
    const nextCreator = creator.trim();
    const originalName = selectedPhraseSet.name ?? "";
    const originalDescription = selectedPhraseSet.description ?? "";
    const originalCreator = selectedPhraseSet.creator ?? "";
    const originalStatus = selectedPhraseSet.status ?? "open";

    const changes = {};
    if (nextName !== originalName) {
      changes.name = nextName;
    }
    if (nextDescription !== originalDescription) {
      changes.description = nextDescription;
    }
    if (nextCreator !== originalCreator) {
      changes.creator = nextCreator;
    }
    if (openStatus !== originalStatus) {
      changes.status = openStatus;
    }

    if (Object.keys(changes).length === 0) {
      setStatus("error");
      setErrorMsg("没有需要修改的内容。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    const { error } = await supabase
      .from("vocabulary_sets")
      .update(changes)
      .eq("id", selectedPhraseSet.id);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
    onChanged?.();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <TriggerButton type="button" aria-label="编辑词汇集">
          <Icon id="edit" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Close asChild>
            <CloseButton type="button" aria-label="关闭">
              <IconWrapper id="close" size="1.3rem" />
            </CloseButton>
          </Close>
          <Title>
            <TitleWord>编辑词汇集</TitleWord>
            <TitleHint>{selectedPhraseSet?.name ?? "未选择"}</TitleHint>
          </Title>

          <Form onSubmit={handleSubmit}>
            <StatusArea>
              {status === "busy" && <BusyMessage>修改中</BusyMessage>}
              {status === "error" && (
                <Message fontSize={FONT_SIZE.default} type="error">
                  发生错误: {errorMsg}
                </Message>
              )}
              {status === "success" && (
                <Message fontSize={FONT_SIZE.default} type="success">
                  修改成功。
                </Message>
              )}
            </StatusArea>

            <Fields>
              <Row>
                <Label htmlFor={nameInputId}>名称</Label>
                <Input
                  id={nameInputId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
              <Row>
                <Label htmlFor={descriptionInputId}>描述</Label>
                <Textarea
                  id={descriptionInputId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
              <TwoColumnRow>
                <CompactRow>
                  <Label htmlFor={creatorInputId}>作者</Label>
                  <Input
                    id={creatorInputId}
                    value={creator}
                    onChange={(event) => setCreator(event.target.value)}
                    disabled={status === "busy"}
                  />
                </CompactRow>
                <CompactRow>
                  <Label htmlFor={statusSelectId}>状态</Label>
                  <Select
                    id={statusSelectId}
                    value={openStatus}
                    onChange={(event) => setOpenStatus(event.target.value)}
                    disabled={status === "busy"}
                    fontSize={FONT_SIZE.small}
                  >
                    <option value="">不修改</option>
                    <option value="open">open</option>
                    <option value="close">close</option>
                  </Select>
                </CompactRow>
              </TwoColumnRow>
              <Row>
                <Label htmlFor={passwordInputId}>密钥</Label>
                <Input
                  id={passwordInputId}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={status === "busy"}
                />
              </Row>
            </Fields>

            <ButtonWrapper>
              <SmallButton disabled={status === "busy"}>保存</SmallButton>
            </ButtonWrapper>
          </Form>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: var(--transparentGray15);
`;

const Content = styled(Dialog.Content)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 90%;
  max-width: ${400 / 16}rem;
  max-height: calc(50% + 10rem);
  height: fit-content;
  border-radius: 1rem;
  background-color: var(--gray95);
  padding: 1.1rem 1.5rem;
`;

const Close = styled(Dialog.Close)`
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  padding: 0.8rem;

  @media ${QUERIES.tabletAndUp} {
    top: 0.3rem;
    right: 0.35rem;
  }
`;

const TriggerButton = styled(UnstyledButton)`
  padding: 0.8rem;
  color: var(--gray15);
`;

const CloseButton = styled(UnstyledButton)`
  color: var(--gray15);
`;

const IconWrapper = styled(Icon)`
  transform: translateY(5px);
`;

const Title = styled(Dialog.Title)`
  display: flex;
  width: 90%;
  column-gap: 1rem;
  flex-wrap: wrap;
`;

const TitleText = styled.p`
  font-size: ${FONT_SIZE.default};
  font-family: ${FONT_FAMILY.chinese_primary};
`;

const TitleWord = styled(TitleText)``;

const TitleHint = styled(TitleText)`
  color: var(--gray40);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusArea = styled.div`
  min-height: 0;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0rem;
`;

const SelectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 8rem;
  overflow: auto;
  color: var(--gray40);
  font-family: ${FONT_FAMILY.japanese_primary}, ${FONT_FAMILY.chinese_primary};
  font-size: ${FONT_SIZE.default};
`;

const SelectedItem = styled.p`
  color: var(--gray15);
`;

const Label = styled.label`
  width: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  font-family: ${FONT_FAMILY.chinese_primary};
  font-size: ${FONT_SIZE.small};

  &::after {
    content: " *";
    font-size: 2rem;
    font-family: ${FONT_FAMILY.english_primary};
    visibility: hidden;
    line-height: 1.5;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  min-width: 0;

  &:has(input:required) ${Label}::after, &[data-required] ${Label}::after {
    color: red;
    visibility: visible;
  }
`;

const TwoColumnRow = styled.div`
  display: flex;
  gap: 0rem;
  align-items: baseline;
  min-width: 0;
`;

const CompactRow = styled(Row)`
  flex: 1 1 0;
`;

const inputStyles = css`
  font-size: ${FONT_SIZE.small};
  display: block;
  min-width: 0;
  flex: 1 100000 0;
  outline: none;

  &:focus {
    outline: 2px solid var(--gray15);
    border-radius: 1px;
    outline-offset: 2px;
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const Textarea = styled.textarea`
  ${inputStyles}
  min-height: 4rem;
  max-height: 10rem;
  resize: vertical;
`;

const ButtonWrapper = styled.div`
  padding: 0 1rem;
`;

const SmallButton = styled(Button)`
  font-size: ${FONT_SIZE.small};
`;

export { AddPhraseSetDialog, DeletePhraseSetDialog, EditPhraseSetDialog };
