//
//  PostUIView.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import SwiftUI

struct PostUIView: View {
    let postView: PostView

    var post: Post {
        get {
            return postView.post
        }
    }

    private let sessionManager = WatchSessionManager.shared

    @Binding var tabSelection: Int
    var isLastPage: Bool

    let requestConnectedInstance: String?

    @State private var showingAlert = false
    @State private var saved: Bool?
    @State var error: Error? = nil

    @State private var isImageLoading = false

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading) {
                Text(post.name)
                    .font(.headline)
                    .padding()

                if let imageURL = post.thumbnailUrl, let url = URL(string: "\(imageURL)?format=jpg") {
                    AsyncImage(url: url, scale: 1, transaction: Transaction(animation: .easeInOut)) { phase in
                        switch phase {
                        case .empty:
                            ProgressView().frame(height: 100)
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFit() // Use scaledToFit() to maintain the original aspect ratio of the image
                                .frame(width: WKInterfaceDevice.current().screenBounds.width) // Set image width to full screen width
                        case .failure:
                            Image(systemName: "wifi.slash").frame(
                                width: WKInterfaceDevice.current().screenBounds.width,
                                height: 100,
                                alignment: .center
                            )
                        @unknown default:
                            EmptyView()
                        }
                    }
                }

                // Use a spacer to push the content to the top if the post content is smaller than the screen height
                Spacer()

                if let body = post.body {
                    Text(.init(body))
                        .padding(.horizontal)
                        .accentColor(.white)
                }

                Button(saved ?? postView.saved ? "Saved" : "Save") {
                    error = nil

                    guard let authToken = sessionManager.authToken, sessionManager.loggedIn, !isStaleFeed() else {
                        showingAlert = true
                        return
                    }

                    APIManager.shared.setup(instanceHostname: requestConnectedInstance ?? "")

                    APIManager.shared.savePost(withID: postView.post.id, authToken: authToken) { result in
                        switch result {
                        case .success:
                            saved = true
                            showingAlert = true
                            // Handle success and show the alert here
                        case .failure(let _error):
                            error = _error
                            showingAlert = true
                        }

                    }
                }
                .padding(.top, 20)
                .alert(getSaveMessage(), isPresented: $showingAlert) {
                    Button("Got it!", role: .cancel) { }
                }

                if (!isLastPage) {
                    Button("Next Post") {
                        self.tabSelection += 1
                    }
                }
            }
        }
    }

    /*
     * If connectedInstance changes, don't allow saving
     */
    private func isStaleFeed() -> Bool {
        if (requestConnectedInstance == sessionManager.connectedInstance) {
            return false
        }

        return true
    }

    private func getSaveMessage() -> String {
        if error != nil {
            return "Error saving post, please try again."
        }

        if isStaleFeed() {
            return "Account changed, please go back to refresh your feed."
        }

        if sessionManager.loggedIn {
            return "Post saved to Lemmy account"
        }

        return "Please login with the Voyager app on your phone to save posts"
    }
}
