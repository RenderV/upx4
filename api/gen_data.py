import requests, time, json
def gen_starting_data():
    headers = {'Content-type': 'application/json'}
    base_url = "http://localhost:8000"
    camera_endpoint = "/api/cams/"
    camera_id = 1
    r = requests.post(f"{base_url}{camera_endpoint}{camera_id}", json={
        "location": "Somewhere",
        "url": "website.com",
    })

    selections = [{"id":"aa9e0b6c-4eec-4766-ae44-cbe4886d118f","selection":[{"x":-333,"y":695,"id":"ee2c2058-d660-488f-a711-932ab36b7e82"},{"x":-381,"y":758,"id":"85b31cd3-2416-476a-9f54-291580d4ae57"},{"x":-247,"y":785,"id":"53f6b66b-fe63-4b38-bf6f-c2bcfe9a8b6b"},{"x":-202,"y":706,"id":"65f532fb-8496-4b85-8f06-695fc3a4dec3"},{"x":-244,"y":657,"id":"37a9df68-4812-4587-9048-ea25547715b6"}]},{"id":"9ec3f641-1146-47cd-8fa2-2c8c19a6b6c6","selection":[{"x":-184,"y":672,"id":"2bc6867c-3ee3-41a4-bb4e-90948182c204"},{"x":-250,"y":858,"id":"9e6acd60-7bc3-47d8-8e7c-ae10c8a1d39e"},{"x":-87,"y":838,"id":"df5227db-aed2-436e-9733-272ed8d7e5c2"},{"x":-79,"y":674,"id":"45e8f0ea-29e4-4cab-87f3-76f0ccab0cc9"}]},{"id":"12024b69-a788-4c8c-a55a-43633ffa434e","selection":[{"x":-140,"y":847,"id":"96221a27-795d-4f48-b3c8-a4ee77a5f873"},{"x":65,"y":856,"id":"3a2a7197-55d9-4b84-8d38-ffe0195e8001"},{"x":55,"y":681,"id":"68d37810-30d0-4292-90be-3ec8d3355566"},{"x":-93,"y":686,"id":"60516e6c-c262-4604-a37b-ec42cec25c5c"}]},{"id":"45574fe3-dfed-44b3-8f37-39a006f70790","selection":[{"x":57,"y":680,"id":"1610a03e-7cc1-4214-8e32-635a2ddf6018"},{"x":51,"y":859,"id":"d830861a-a413-4672-b890-007b38375f2d"},{"x":240,"y":853,"id":"ba6d84ec-412d-44f2-ad56-d824b004ef03"},{"x":179,"y":673,"id":"0b3d3db9-fdd1-4a73-8c56-36c216df84d6"}]},{"id":"c2829061-f7ed-4c79-8ba2-4953ba121175","selection":[{"x":196,"y":676,"id":"248e138d-1019-4085-8c06-8e193b185242"},{"x":246,"y":863,"id":"523344a8-7f40-4f39-b7d5-08eca5f8f15c"},{"x":420,"y":865,"id":"f0539cb2-5be5-4cd2-8c6d-e7475959bdce"},{"x":327,"y":670,"id":"a106afe2-cdce-4004-a5f7-12558718b949"}]},{"id":"aa12c08d-8847-4ef3-b1b2-6447bb645e06","selection":[{"x":320,"y":683,"id":"99c21206-3bf1-42fc-8cdf-08a6c975cf86"},{"x":424,"y":871,"id":"0ee42e16-ef31-496d-b79d-c7b544a1b18a"},{"x":607,"y":883,"id":"6eca6a51-a48a-4404-851a-21ce40e6abc2"},{"x":447,"y":691,"id":"77f7afc8-f8b0-48d7-a6b6-6061614f1772"}]},{"id":"b973f489-b411-4d9f-8ea0-d6c56afdb621","selection":[{"x":490,"y":729,"id":"5d7c34ab-0c2d-4727-b1b2-e77982ff4437"},{"x":624,"y":890,"id":"dcee699b-582d-46ba-9a4b-d29f364ac998"},{"x":830,"y":907,"id":"9643ca00-2e7e-498c-9347-2cb3f7401f02"},{"x":627,"y":712,"id":"25cee4a7-aaf8-4f42-b981-33866ebbf54c"}]},{"id":"79502938-8d9b-4f5d-bedc-d63adabfe1f0","selection":[{"x":653,"y":725,"id":"f1b370b7-4068-4795-a9a6-f995c23faf62"},{"x":838,"y":907,"id":"2ce0508f-b6a8-49f0-9c26-70a2dc4db5a7"},{"x":1025,"y":919,"id":"f609a19f-fd47-4faa-ab15-d3858f6a8081"},{"x":856,"y":781,"id":"3937b791-90d4-41ee-ae0f-cc32fec6cc07"}]}]

    parking_space_endpoint = "api/parking_space"
    point_endpoint = "/api/point/"

    for selection in selections:
        r = requests.post(f"{base_url}/{parking_space_endpoint}/{selection['id']}", json={
            "label": "vaga-"+selection["id"][:20],
            "camera": camera_id,
        })
        for point in selection["selection"]:
            data = {
                "x": point["x"],
                "y": point["y"],
                "parking_space": selection["id"]
            }
            requests.post(f"{base_url}{point_endpoint}{point['id']}", json=data)


if __name__ == "__main__":
    tries = 10
    timeout = 10
    for i in range(tries):
        try:
            gen_starting_data()
            break
        except Exception as e:
            if(i+1 == tries):
                raise e
            else:
                print("Error generating data, trying again in 5 seconds: ")
        time.sleep(timeout)