import React from "react";
import styled from "styled-components";
import supabase from "../supabaseClient";
import { FONT_FAMILY, FONT_SIZE } from "../constants";
import BusyMessage from "./BusyMessage";
import Icon from "./Icon";
import Message from "./Message";
import Select from "./Select";
import UnstyledButton from "./UnstyledButton";
import {
  ButtonWrapper,
  CompactRow,
  Fields,
  FormModal,
  Form,
  Input,
  Label,
  Row,
  StatusArea,
  SubmitButton,
  Textarea,
  TwoColumnRow,
} from "./FormModal";

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
    <FormModal
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <TriggerButton type="button" aria-label="添加新的词汇集">
          <Icon id="folderPlus" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      }
      title="添加词汇集"
      titleHint="vocabulary_sets"
    >
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
              <SubmitButton disabled={status === "busy"}>添加</SubmitButton>
            </ButtonWrapper>
      </Form>
    </FormModal>
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
    <FormModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <TriggerButton type="button" aria-label="删除已选词汇集">
          <Icon id="remove" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      }
      title="删除词汇集"
      titleHint={`${selectedPhraseSets.length} 个已选`}
    >
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
              <SubmitButton disabled={status === "busy" || !hasSelection}>
                删除
              </SubmitButton>
            </ButtonWrapper>
      </Form>
    </FormModal>
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
    <FormModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <TriggerButton type="button" aria-label="编辑词汇集">
          <Icon id="edit" size="1.3rem" color="var(--gray15)" />
        </TriggerButton>
      }
      title="编辑词汇集"
      titleHint={selectedPhraseSet?.name ?? "未选择"}
    >
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
              <SubmitButton disabled={status === "busy"}>保存</SubmitButton>
            </ButtonWrapper>
      </Form>
    </FormModal>
  );
}

const TriggerButton = styled(UnstyledButton)`
  padding: 0.8rem;
  color: var(--gray15);
`;

const SelectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 8rem;
  overflow: auto;
  color: var(--gray40);
  font-family: ${FONT_FAMILY.chinese_primary}, ${FONT_FAMILY.japanese_primary};
  font-size: ${FONT_SIZE.default};
`;

const SelectedItem = styled.p`
  color: var(--gray15);
`;

export { AddPhraseSetDialog, DeletePhraseSetDialog, EditPhraseSetDialog };
