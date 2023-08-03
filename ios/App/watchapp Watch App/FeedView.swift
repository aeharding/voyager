//
//  FeedView.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import SwiftUI

struct FeedView: View {
    @State private var selectedPage = 0
    @StateObject var viewModel = FeedViewModel()

    private let sessionManager = WatchSessionManager.shared

    var body: some View {
        ZStack {
            // Show loading indicator while data is being fetched
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.error != nil {
                // Show error message if there's an error
                VStack(spacing: 20) {
                    Text("An error occurred loading your feed.")
                    Button("Retry", action: viewModel.fetchData)
                }
            } else {
                TabView(selection: $selectedPage) {
                    if (viewModel.posts.isEmpty) {
                        Text("Your home feed is empty. Subscribe to some communities with the Voyager app!").tag(0)
                    } else {
                        ForEach(Array(viewModel.posts.enumerated()), id: \.offset) { index, post in
                            PostUIView(
                                postView: post,
                                tabSelection: $selectedPage,
                                isLastPage: index == viewModel.posts.count - 1,
                                requestConnectedInstance: viewModel.requestConnectedInstance
                            ).tag(index)
                        }
                    }
                }
                .animation(.easeOut(duration: 0.2), value: selectedPage)
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never)) // Hide the dots at the bottom
            }
        }
        .onAppear {
            viewModel.fetchData()
        }
        .navigationTitle(Text("Home"))
        .navigationBarTitleDisplayMode(.inline)
    }
}
