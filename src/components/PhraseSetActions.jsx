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
  PasswordInput,
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
  const statusSelectId = React.useId();
  const privacySelectId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [creator, setCreator] = React.useState("");
  const [openStatus, setOpenStatus] = React.useState("open");
  const [privacy, setPrivacy] = React.useState("public");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setStatus("error");
      setErrorMsg("词汇集名称不能为空。");
      return;
    }

    if (!password.trim()) {
      setStatus("error");
      setErrorMsg("创建词汇集需要设置密码。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setErrorMsg("请先登录后再创建词汇集。");
      return;
    }

    const { error } = await supabase.rpc("create_vocabulary_set", {
      p_name: name.trim(),
      p_description: description.trim() || null,
      p_status: openStatus,
      p_creator: creator.trim() || null,
      p_privacy: privacy,
      p_password: password.trim(),
      p_user_id: user?.id ?? null,
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
    setOpenStatus("open");
    setPrivacy("public");
    setStatus("success");
    onChanged?.();
  }

  return (
    <FormModal
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <TriggerButton type="button" aria-label="添加新的词汇集">
          <Icon id="folderPlus" size="1.3rem" color="black" />
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
          <TwoColumnRow>
            <CompactRow>
              <Label htmlFor={privacySelectId}>权限</Label>
              <Select
                id={privacySelectId}
                value={privacy}
                onChange={(event) => setPrivacy(event.target.value)}
                disabled={status === "busy"}
                fontSize={FONT_SIZE.small}
              >
                <option value="public">public</option>
                <option value="private">private</option>
              </Select>
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
                <option value="open">open</option>
                <option value="close">close</option>
              </Select>
            </CompactRow>
          </TwoColumnRow>
          <Row>
            <Label htmlFor={passwordInputId}>密码</Label>
            <PasswordInput
              id={passwordInputId}
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

function JoinPhraseSetDialog({ onChanged }) {
  const setIdInputId = React.useId();
  const passwordInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputId, setInputId] = React.useState("");
  const [inputPassword, setInputPassword] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("info");

  function handleOpenChange(nextIsOpen) {
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      setInputId("");
      setInputPassword("");
      setStatus("free");
      setMessage("");
      setMessageType("info");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!inputId.trim()) {
      setStatus("error");
      setMessageType("error");
      setMessage("请输入词汇集 ID。");
      return;
    }

    setStatus("busy");
    setMessage("");
    setMessageType("info");

    const { data, error } = await supabase.rpc("join_vocabulary_set", {
      p_set_id: Number(inputId),
      p_password: inputPassword,
    });

    if (error) {
      setStatus("error");
      setMessageType("error");
      setMessage("请先登录或检查网络后重试。");
      return;
    }

    if (data === "ok") {
      setStatus("success");
      setMessageType("success");
      setMessage("加入成功");
      setInputId("");
      setInputPassword("");
      onChanged?.();
      return;
    }

    setStatus("error");
    setMessageType("error");
    if (data === "wrong_password") {
      setMessage("密码错误");
    } else if (data === "not_found") {
      setMessage("未找到该词汇集或该词汇集不是私有的");
    } else {
      setMessage("加入失败，请稍后重试。");
    }
  }

  return (
    <FormModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <TriggerButton type="button" aria-label="加入私有词汇集">
          <Icon id="public" size="1.3rem" color="black" />
        </TriggerButton>
      }
      title="加入词汇集"
      titleHint="set_members"
    >
      <Form onSubmit={handleSubmit}>
        <StatusArea>
          {status === "busy" && <BusyMessage>加入中</BusyMessage>}
          {(status === "error" || status === "success") && (
            <Message fontSize={FONT_SIZE.default} type={messageType}>
              {message}
            </Message>
          )}
        </StatusArea>

        <Fields>
          <Row>
            <Label htmlFor={setIdInputId}>ID</Label>
            <Input
              id={setIdInputId}
              type="number"
              min="1"
              step="1"
              value={inputId}
              onChange={(event) => setInputId(event.target.value)}
              required
              disabled={status === "busy"}
            />
          </Row>
          <Row>
            <Label htmlFor={passwordInputId}>密码</Label>
            <PasswordInput
              id={passwordInputId}
              value={inputPassword}
              onChange={(event) => setInputPassword(event.target.value)}
              disabled={status === "busy"}
            />
          </Row>
        </Fields>

        <ButtonWrapper>
          <SubmitButton disabled={status === "busy"}>加入</SubmitButton>
        </ButtonWrapper>
      </Form>
    </FormModal>
  );
}

function DeletePhraseSetDialog({
  selectedPhraseSets,
  currentUserId,
  onChanged,
}) {
  const passwordInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  const hasSelection = selectedPhraseSets.length > 0;
  const canDeleteSelection =
    hasSelection &&
    selectedPhraseSets.every(
      (phraseSet) => phraseSet.user_id && phraseSet.user_id === currentUserId
    );

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

    if (!canDeleteSelection) {
      setStatus("error");
      setErrorMsg("只有创建者才能删除词汇集。");
      return;
    }

    const inputPassword = password.trim();
    if (!inputPassword) {
      setStatus("error");
      setErrorMsg("请输入词汇集密码。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    const selectedIds = selectedPhraseSets.map((phraseSet) => phraseSet.id);
    for (const selectedId of selectedIds) {
      const { data, error } = await supabase.rpc("delete_vocabulary_set", {
        p_set_id: selectedId,
        p_password: inputPassword,
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      if (data === "wrong_password") {
        setStatus("error");
        setErrorMsg("词汇集密码不正确。");
        return;
      }

      if (data === "not_found") {
        setStatus("error");
        setErrorMsg("没有删除权限或词汇集不存在。");
        return;
      }

      if (data !== "ok") {
        setStatus("error");
        setErrorMsg("删除失败，请稍后重试。");
        return;
      }
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
          <Icon id="remove" size="1.3rem" color="black" />
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

        {hasSelection && !canDeleteSelection ? (
          <PermissionMessage>
            只有词汇集创建者才能删除词汇集。
          </PermissionMessage>
        ) : (
          <>
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
                <Label htmlFor={passwordInputId}>密码</Label>
                <PasswordInput
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
          </>
        )}
      </Form>
    </FormModal>
  );
}

function EditPhraseSetDialog({ selectedPhraseSet, currentUserId, onChanged }) {
  const nameInputId = React.useId();
  const descriptionInputId = React.useId();
  const creatorInputId = React.useId();
  const statusSelectId = React.useId();
  const privacySelectId = React.useId();
  const newPasswordInputId = React.useId();

  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [creator, setCreator] = React.useState("");
  const [openStatus, setOpenStatus] = React.useState("");
  const [privacy, setPrivacy] = React.useState("public");
  const [newPassword, setNewPassword] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");
  const canEditSelectedPhraseSet =
    !!selectedPhraseSet?.user_id && selectedPhraseSet.user_id === currentUserId;

  function handleOpenChange(nextIsOpen) {
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      setName(selectedPhraseSet?.name ?? "");
      setDescription(selectedPhraseSet?.description ?? "");
      setCreator(selectedPhraseSet?.creator ?? "");
      setOpenStatus(selectedPhraseSet?.status ?? "open");
      setPrivacy(selectedPhraseSet?.privacy ?? "public");
      setNewPassword("");
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

    if (!canEditSelectedPhraseSet) {
      setStatus("error");
      setErrorMsg("只有创建者才能编辑词汇集。");
      return;
    }

    const nextName = name.trim();
    const nextDescription = description.trim();
    const nextCreator = creator.trim();
    const originalName = selectedPhraseSet.name ?? "";
    const originalDescription = selectedPhraseSet.description ?? "";
    const originalCreator = selectedPhraseSet.creator ?? "";
    const originalStatus = selectedPhraseSet.status ?? "open";
    const originalPrivacy = selectedPhraseSet.privacy ?? "public";
    const nextPassword = newPassword.trim();
    const hasPasswordChange = nextPassword.length > 0;

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
    if (privacy !== originalPrivacy) {
      changes.privacy = privacy;
    }

    const hasSetChanges = Object.keys(changes).length > 0;

    if (!hasSetChanges && !hasPasswordChange) {
      setStatus("error");
      setErrorMsg("没有需要修改的内容。");
      return;
    }

    setStatus("busy");
    setErrorMsg("");

    if (hasSetChanges) {
      const { error } = await supabase
        .from("vocabulary_sets")
        .update(changes)
        .eq("id", selectedPhraseSet.id)
        .eq("user_id", currentUserId);

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
    }

    if (hasPasswordChange) {
      const { data, error } = await supabase.rpc("update_vocabulary_set_password", {
        p_set_id: selectedPhraseSet.id,
        p_new_password: nextPassword,
      });

      if (error) {
        console.error("修改失败:", error.message);
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      if (data === "not_found") {
        setStatus("error");
        setErrorMsg("没有编辑权限或词汇集不存在。");
        return;
      }
    }

    setNewPassword("");
    setStatus("success");
    onChanged?.();
  }

  return (
    <FormModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <TriggerButton type="button" aria-label="编辑词汇集">
          <Icon id="edit" size="1.3rem" color="black" />
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

        {selectedPhraseSet && !canEditSelectedPhraseSet ? (
          <PermissionMessage>
            只有词汇集创建者才能编辑词汇集。
          </PermissionMessage>
        ) : (
          <>
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
                  <Label htmlFor={privacySelectId}>权限</Label>
                  <Select
                    id={privacySelectId}
                    value={privacy}
                    onChange={(event) => setPrivacy(event.target.value)}
                    disabled={status === "busy"}
                    fontSize={FONT_SIZE.small}
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                  </Select>
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
                    <option value="open">open</option>
                    <option value="close">close</option>
                  </Select>
                </CompactRow>
              </TwoColumnRow>
              <Row>
                <Label htmlFor={creatorInputId}>作者</Label>
                <Input
                  id={creatorInputId}
                  value={creator}
                  onChange={(event) => setCreator(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
              <Row>
                <Label htmlFor={newPasswordInputId}>新密码</Label>
                <PasswordInput
                  id={newPasswordInputId}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={status === "busy"}
                />
              </Row>
            </Fields>

            <ButtonWrapper>
              <SubmitButton disabled={status === "busy"}>保存</SubmitButton>
            </ButtonWrapper>
          </>
        )}
      </Form>
    </FormModal>
  );
}

const TriggerButton = styled(UnstyledButton)`
  padding: 0.8rem;
  color: black;
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

const PermissionMessage = styled.p`
  color: var(--gray15);
  font-family: ${FONT_FAMILY.chinese_primary}, ${FONT_FAMILY.japanese_primary};
  font-size: ${FONT_SIZE.default};
  line-height: 1.5;
  text-align: center;
`;

export {
  AddPhraseSetDialog,
  DeletePhraseSetDialog,
  EditPhraseSetDialog,
  JoinPhraseSetDialog,
};
