import { List, ActionPanel, Action, popToRoot, showToast, Toast, Form } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchGoals, sendDatapoint } from "./api";
import { fromUnixTime, differenceInDays } from "date-fns";

export default function Beeminder() {
  const [goals, setGoals] = useState();
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const goalsData = await fetchGoals();
      setLoading(false);

      if (goalsData.errors?.auth_token === "bad_token") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Bad Auth Token",
          message: "Please check your auth token in the extension preferences.",
        });
        popToRoot();
      } else {
        // Happy path
        setGoals(goalsData);
      }
    } catch (error) {
      setLoading(false);
      await showToast({
        style: Toast.Style.Failure,
        title: "Something went wrong",
        message: "Failed to load your goals",
      });
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function ValueForm({ goalSlug }) {
    const [dataPointError, setDataPointError] = useState();

    function dropDataPointErrorIfNeeded() {
      if (dataPointError && dataPointError.length > 0) {
        setDataPointError(undefined);
      }
    }

    function validateDataPoint(event) {
      if (event.target.value?.length == 0) {
        setDataPointError("The field should't be empty!");
      } else {
        dropDataPointErrorIfNeeded();
      }
    }

    function handleDataPointInputChange(event) {
      if (event > 0) {
        dropDataPointErrorIfNeeded();
      } else {
        setDataPointError("This field should't be empty!");
      }

      if (isNaN(event)) {
        setDataPointError("This field should be a number!");
      }
    }

    return (
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              onSubmit={async (values) => {
                try {
                  await sendDatapoint(goalSlug, values.datapoint, values.comment);
                  popToRoot();
                  await showToast({
                    style: Toast.Style.Success,
                    title: "Datapoint submitted",
                    message: "Your datapoint was submitetd successfully",
                  });
                } catch (error) {
                  popToRoot();
                  await showToast({
                    style: Toast.Style.Failure,
                    title: "Something went wrong",
                    message: "Failed to submit your datapoint",
                  });
                }
              }}
            />
          </ActionPanel>
        }
      >
        <Form.TextField
          id="datapoint"
          title="Datapoint"
          autoFocus
          placeholder={`Enter datapoint for ${goalSlug}`}
          error={dataPointError}
          onChange={(event) => handleDataPointInputChange(event)}
          onFocus={(event) => validateDataPoint(event)}
          onBlur={(event) => validateDataPoint(event)}
        />

        <Form.TextField id="comment" title="Comment" defaultValue="Sent from Raycast 🐝" />
      </Form>
    );
  }

  function GoalsList({ goalsData }) {
    return (
      <List isLoading={loading}>
        {goalsData?.map((goal) => {
          const [beforeIn, afterIn] = goal.limsum.split("+")?.[1].split(" (")?.[0].split(" in ");
          let goalIcon;

          if (differenceInDays(fromUnixTime(goal.losedate), new Date()) < 1) {
            goalIcon = "🔴";
          } else if (differenceInDays(fromUnixTime(goal.losedate), new Date()) < 2) {
            goalIcon = "🟠";
          } else if (differenceInDays(fromUnixTime(goal.losedate), new Date()) < 3) {
            goalIcon = "🔵";
          } else {
            goalIcon = "🟢";
          }

          return (
            <List.Item
              key={goal.slug}
              title={goal.slug}
              subtitle={`Pledged $${goal.pledge}`}
              accessories={[
                { text: `Due ${beforeIn} ${goal.gunits} in ${afterIn}`, icon: goalIcon },
              ]}
              keywords={[goal.slug, goal.title]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Enter datapoint"
                    target={<ValueForm goalSlug={goal.slug} />}
                  />
                  <Action title="Refresh data" onAction={async () => await fetchData()} />
                </ActionPanel>
              }
            />
          );
        })}
      </List>
    );
  }

  return <GoalsList goalsData={goals} />;
}