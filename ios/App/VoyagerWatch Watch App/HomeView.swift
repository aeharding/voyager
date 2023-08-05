//
//  HomeView.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import SwiftUI

struct HomeView: View {
    @ObservedObject var sessionManager = WatchSessionManager.shared

    var body: some View {
        VStack(spacing: 20) {
            NavigationLink(destination: FeedView()) {
                Text("Home Feed")
            }

            Text("Connected to\n\(sessionManager.connectedInstance)")
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}
